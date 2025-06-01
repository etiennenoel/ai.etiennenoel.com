import {PerformanceTestSeriesEnum} from '../enums/performance-test-series.enum';
import {SummarizerTypeEnum} from '../../app/enums/summarizer-type.enum';
import {SummarizerFormatEnum} from '../../app/enums/summarizer-format.enum';
import {SummarizerLengthEnum} from '../../app/enums/summarizer-length.enum';

export const PerformanceTestSeriesConfig: {[key in PerformanceTestSeriesEnum]: {
  //numberOfExecutions: number,
  //refreshBetweenExecutions: boolean,
  creationOptions: any,
  executionOptions: any,
}} = {
  [PerformanceTestSeriesEnum.SummarizerHeadlineSmall]: {
    //numberOfExecutions: 5,
    //refreshBetweenExecutions: true,
    creationOptions: {
      type: SummarizerTypeEnum.Headline,
      format: SummarizerFormatEnum.PlainText,
      length: SummarizerLengthEnum.Short,
    },
    executionOptions: {
      input: "Birds are a fascinating and diverse group of warm-blooded vertebrates belonging to the class Aves. What distinguishes them from all other animals is the presence of feathers, a remarkable adaptation that serves multiple purposes, including flight, insulation, and display. Their anatomy is specifically tailored for an aerial existence, featuring lightweight yet strong skeletons with hollow bones, powerful flight muscles anchored to a keeled sternum, and the absence of teeth, which reduces weight. Birds exhibit a high metabolic rate and a four-chambered heart, essential for the energy demands of flight. They reproduce by laying hard-shelled eggs and display a wide range of parental care behaviors.The diversity of birds is astounding, with over 10,000 recognized species inhabiting nearly every terrestrial and aquatic ecosystem on Earth. Their sizes range from the tiny bee hummingbird to the enormous ostrich. This incredible variety is reflected in their diverse diets, behaviors, and ecological roles. Birds play crucial roles in their ecosystems as pollinators, seed dispersers, predators, and prey, contributing significantly to the balance of nature. Their songs and calls fill the environment, adding to the richness of our planet's biodiversity.Over millions of years, birds have evolved a remarkable array of adaptations that allow them to thrive in their specific environments. Their beaks, feet, and wings show incredible variation, each form suited to a particular lifestyle and food source. For instance, the sharp, hooked beak of a raptor is perfect for tearing flesh, while the long, slender beak of a hummingbird is adapted for sipping nectar. Similarly, webbed feet aid aquatic birds in swimming, while strong talons enable birds of prey to grasp their quarry. These adaptations highlight the intricate relationship between birds and their surroundings, making them a captivating subject of study and a vital component of our natural world.",
    },
  },
}
