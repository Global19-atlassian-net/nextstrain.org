// Server handlers for authentication (authn).  Authorization (authz) is done
// in the server's charon handlers.
//
const querystring = require("querystring");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const sources = require("./auspice/server/sources");
const utils = require("./auspice/server/utils");

const PRODUCTION = process.env.NODE_ENV === "production";

const SESSION_SECRET = PRODUCTION
  ? process.env.SESSION_SECRET
  : "BAD SECRET FOR DEV ONLY";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30d in seconds

const COGNITO_USER_POOL_ID = "us-east-1_Cg5rcTged";

const COGNITO_REGION = COGNITO_USER_POOL_ID.split("_")[0];

const COGNITO_BASE_URL = "https://login.nextstrain.org";

const COGNITO_CLIENT_ID = PRODUCTION
  ? "rki99ml8g2jb9sm1qcq9oi5n"    // prod client limited to nextstrain.org
  : "6q7cmj0ukti9d9kdkqi2dfvh7o"; // dev client limited to localhost and heroku dev instances

function setup(app) {
  // Use OAuth2 to authenticate against AWS Cognito's identity provider (IdP)
  const OAuth2Strategy = require("passport-oauth2").Strategy;

  // Implement OAuth2Strategy's stub for fetching user info.
  OAuth2Strategy.prototype.userProfile = async (accessToken, done) => {
    try {
      const response = await fetch(
        `${COGNITO_BASE_URL}/oauth2/userInfo`,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      const profile = await response.json();
      return done(null, profile);
    }
    catch (error) {
      return done(`Unable to fetch user info: ${error}`);
    }
  };

  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: `${COGNITO_BASE_URL}/oauth2/authorize`,
        tokenURL: `${COGNITO_BASE_URL}/oauth2/token`,
        clientID: COGNITO_CLIENT_ID,
        callbackURL: "/logged-in",
        pkce: true,
        state: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        // Fetch groups from Cognito, which our data sources
        // (auspice/server/sources.js) use for authorization.
        //
        // In the future we could use Cognito Identity Pools to get per-user
        // AWS credentials, but that's more complicated and takes more to
        // setup.
        const cognitoIdp = new AWS.CognitoIdentityServiceProvider({region: COGNITO_REGION});

        const response = await cognitoIdp.adminListGroupsForUser({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: profile.username,
        }).promise();

        const groups = response.Groups.map(g => g.GroupName);

        // All users are ok, as we control the entire user pool.
        return done(null, {...profile, groups});
      }
    )
  );

  // Serialize the entire user profile to the session store to avoid additional
  // requests to Cognito when we need to load back a user profile from their
  // session cookie.
  passport.serializeUser((profile, done) => {
    return done(null, JSON.stringify(profile));
  });

  passport.deserializeUser((profile, done) => {
    return done(null, JSON.parse(profile));
  });

  // Setup session storage and passport.
  //
  // XXX TODO: Eventually we'll want a more sophisticated session store that
  // can be shared between server instances (dynos).  For now, use a local file
  // store on each server instance and use session affinity.
  //   -trs, 30 Aug 2019
  app.use(
    session({
      name: "nextstrain.org",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: new FileStore({ttl: SESSION_MAX_AGE}),
      cookie: {
        secure: PRODUCTION,
        maxAge: SESSION_MAX_AGE * 1000, // milliseconds
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Set the app's origin centrally so other handlers can use it
  //
  // We can trust the HTTP Host header (req.hostname) because we're always
  // running behind name-based virtual hosting on Heroku.  A forged Host header
  // will be rejected by Heroku and never make it to us.
  app.use((req, res, next) => {
    res.locals.origin = PRODUCTION
      ? `${req.protocol}://${req.hostname}`
      : `${req.protocol}://${req.hostname}:${req.app.get("port")}`;
    next();
  });

  // Routes
  //
  // Authenticate with Cognito IdP on /login and establish a local session
  app.route("/login").get(
    (req, res, next) => {
      /* Save the original page the user was on with a best-effort approach.
       * If there is no Referer or it's not parseable as a URL, then ignore it
       * and we'll do the default thing of redirecting to the home page.
       *
       * Only use the Referer if it points to ourselves, so that our login flow
       * can't be abused to send folks to external sites.
       */
      try {
        const referer = new URL(req.header("Referer"));

        if (res.locals.origin === referer.origin) {
          req.session.afterLoginReturnTo = referer.pathname;
        }
      } catch (e) {}
      next();
    },
    passport.authenticate("oauth2")
  );

  // Verify IdP response on /logged-in
  app.route("/logged-in").get(
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    (req, res) => {
      // We can trust this value from the session because we are the only ones
      // in control of it.
      res.redirect(req.session.afterLoginReturnTo || "/");
    }
  );

  // Delete our local session and redirect to logout from Cognito IdP
  app.route("/logout").get((req, res) => {
    req.session.destroy(() => {
      const params = {
        client_id: COGNITO_CLIENT_ID,
        logout_uri: res.locals.origin,
      };
      res.redirect(`${COGNITO_BASE_URL}/logout?${querystring.stringify(params)}`);
    });
  });

  // Provide the client-side app with info about the current user
  app.route("/whoami").get((req, res) => {
    res.format({
      // XXX TODO: This is really janky, but we can make it nicer in the
      // future.
      //   -trs, 30 Aug 2019
      html: () => res.send(
        req.user
          ? `You’re logged in as <strong>${req.user.username}</strong>.
             You are in the groups <strong>${req.user.groups.join(", ")}</strong>.
             <a href="/logout">Logout</a>`
          : `You are not logged in.
             <a href="/login">Login</a>`
      ),

      // Express's JSON serialization drops keys with undefined values
      json: () => res.json({ user: req.user || null }),
    });
  });

  const nonPublicSources = Array.from(sources.entries())
    .filter(([name, source]) => !source.visibleToUser(null))
    .map(([name, source]) => `/${name}`);

  app.use(nonPublicSources, (req, res, next) => {
    // Prompt for login if an anonymous user asks for a non-public dataset.
    if (!req.user) {
      utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
      req.session.afterLoginReturnTo = req.originalUrl;
      return res.redirect("/login");
    }

    // Otherwise, let the server's normal route handle this request, which
    // should fall through to Auspice.
    next("route");
  });
}

module.exports = {
  setup
};