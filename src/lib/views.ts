import type {CollectionRecord} from "./models";
import type {PhotoSet} from "./conferenceSlides";
import type {ProjectSummary} from "./archive";

export type ProjectView = ProjectSummary & { photoSet?: PhotoSet };
export type CollectionView = CollectionRecord & { photoSet?: PhotoSet };

