import React from "react";
import Helmet from "react-helmet";
import SEO from "../../components/SEO/SEO"
import Navigation from '../../components/Header'
import {HeaderContainer, RightHandAside, Bigspacer} from "../../layouts/generalComponents";
import {Logos} from "../../layouts/logos";

const asideContent = (
  <div>
    <Bigspacer />
    Concept by <a href="https://neherlab.org/richard-neher.html">Richard Neher</a> and <a href="http://bedford.io/team/trevor-bedford/">Trevor Bedford</a>.
    <p />
    Built by <a href="https://neherlab.org/richard-neher.html">Richard Neher</a>, <a href="http://bedford.io/team/trevor-bedford/">Trevor Bedford</a>, <a href="http://bedford.io/team/james-hadfield/">James Hadfield</a>, <a href="http://www.colinmegill.com/">Colin Megill</a>, <a href="http://bedford.io/team/sidney-bell/">Sidney Bell</a>, <a href="http://bedford.io/team/john-huddleston/">John Huddleston</a>, <a href="http://bedford.io/team/barney-potter/">Barney Potter</a>, <a href="http://bedford.io/team/charlton-callender/">Charlton Callender</a> and <a href="https://neherlab.org/pavel-sagulenko.html">Pavel Sagulenko</a>.
    <p />
    All <a href="http://github.com/nextstrain">source code</a> is freely available under the terms of the <a href="http://github.com/nextstrain/auspice/blob/master/LICENSE.txt">GNU Affero General Public License</a>. Screenshots etc may be used as long as a link to nextstrain.org is provided.
    <p />
    This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions.
    <p />
    Special thanks to Nick Loman, Kristian Andersen, Andrew Rambaut, Matt Cotten and Paul Kellam for comments, suggestions and data sharing.
    <p />
    Splash page images stylised in <a href="http://www.lunapic.com/">Lunapic</a>. <a href="https://en.wikipedia.org/wiki/Zika_virus#/media/File:197-Zika_Virus-ZikaVirus.tif">Zika drawing</a> by David Goodwill, <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC156766/figure/cdg270f4/">Dengue EM</a> by Zhang et al, <a href="https://commons.wikimedia.org/wiki/Ebola#/media/File:Ebola_virus_em.png">Ebola EM</a> by Frederick Murphy / CDC, <a href="https://www.cdc.gov/media/subtopic/library/diseases.htm">Influenza images</a> by Cynthia Goldsmith / Thomas Rowe / CDC.
  </div>
);


export default class AboutPage extends React.Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>{`About Nextstrain`}</title>
        </Helmet>
        <SEO />
        <HeaderContainer>
          <Navigation location={this.props.location} />
        </HeaderContainer>
        <RightHandAside asideContent={asideContent} title="About">
          <h2>Viral Phylogenies</h2>

          {`In the course of an infection and over an epidemic, viral pathogens naturally accumulate random mutations to their genomes.
          This is an inevitable consequence of error-prone viral replication.
          Since different viruses typically pick up different mutations, mutations can be used as a marker of transmission in which closely related viral genomes indicate closely related infections.
          By reconstructing a viral "phylogeny" we can learn about important epidemiological phenomena such as spatial spread, introduction timings and epidemic growth rate.`}

          <h2>Actionable Inferences</h2>

          However, if viral genome sequences are going to inform public health interventions, then analyses have to be rapidly conducted and results widely disseminated. Current scientific publishing practices hinder the rapid dissemination of epidemiologically relevant results. We thought an open online system that implements robust bioinformatic pipelines to synthesize data from across research groups has the best capacity to make epidemiologically actionable inferences.

          <h2>This Website</h2>

          This website aims to provide a <i>real-time</i> snapshot of evolving viral populations and to provide interactive data visualizations to virologists, epidemiologists, public health officials and citizen scientists. Through interactive data visualizations, we aim to allow exploration of continually up-to-date datasets, providing a novel surveillance tool to the scientific and public health communities.

          <h2>Current Datasets</h2>

          <p />
          Influenza Virus <a href="https://app.nextstrain.org/flu/h3n2/ha/3y">A/H3N2</a>, <a href="https://app.nextstrain.org/flu/h1n1pdm/ha/3y">A/H1N1pdm</a>, <a href="https://app.nextstrain.org/flu/vic/ha/3y">B/vic</a> and <a href="https://app.nextstrain.org/flu/yam/ha/3y">B/yam</a><p />
          Datasets are shown together with antigen evolution, epitope mutations and clade frequency changes over the past 2-12 years.

          <p />
          <a href="https://app.nextstrain.org/ebola">Ebola Virus</a>
          <p />

          The 2013-2016 Ebola outbreak caused worldwide alarm and over 10,000 fatalities in West Africa. Nextstrain allows exploration of the phylogeny of over 1500 genomes, complete with temporal and geographic data and inferred transmission events. For a review into how genomic sequencing helped understand this outbreak see <a href="http://www.nature.com/nature/journal/v538/n7624/full/nature19790.html">Holmes <i>et al</i></a>

          <p />
          <a href="https://app.nextstrain.org/zika">Zika Virus</a>
          <p />

          The ongoing (2015-) epidemic of zika fever in the Americas is seen here in the context of over 400 genomes including isolates from Asia and the Pacific Islands. Multiple trans-Pacific and trans-Atlantic transmission events are easily seen, as well as the complex transmission routes between Brazil, Central America and the USA.

          <p />
          <a href="https://app.nextstrain.org/dengue">Dengue Virus</a>
          <p />

          Since the 1970s, dengue fever has rapidly expanded to become endemic to most tropical regions of the globe; today, approximately 40% of the total human population is at risk. There are four serotypes of dengue, DENV1-4. This rapid geographical expansion and genetic diversification is clearly seen here in the analysis of dengue genome sequences (curated by <a href="https://hfv.lanl.gov/components/sequence/HCV/search/searchi.html">LANL</a>). More information about dengue can be found at the <a href="http://www.who.int/denguecontrol/en/">WHO</a>.

          <p />
          <a href="https://app.nextstrain.org/avian/h7n9">Avian Influenza A/H7N9</a>
          <p />

          First detected in Humans in 2013, China is currently experiencing the fifth epidemic of avian influenza A(H7N9), which has a mortality rate of around 40%. The current epidemic is marked by a significant increase in cases compared to the past four winters, the reasons for which are unclear. Here, analysis of 1200 HA and NA genes (via <a href="http://platform.gisaid.org/">GISAID</a>) allows visualization of the inferred host jumps and geographic progression of this lineage over time. For more information see <a href="https://www.cdc.gov/mmwr/volumes/66/wr/mm6609e2.htm">Iuliano et al</a> and the <a href="https://www.cdc.gov/flu/avianflu/h7n9-virus.htm">CDC</a>.

          <h2>Future Directions</h2>
          Nextstrain is under active development and we have big plans for its future, including visualization, bioinformatics analysis and an increasing number and variety of datasets. Please get in touch with <a href="https://twitter.com/richardneher">@richardneher</a> or <a href="https://twitter.com/trvrb">@trvrb</a> with any questions or comments.


        </RightHandAside>

        <Logos />
      </div>
    );
  }
}
