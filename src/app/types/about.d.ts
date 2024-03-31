export interface CareerDeckProps {
  jobs: Job[];
  setSelectedJob: (job: Job | null) => void;
}

export interface ProjectGridProps {
  projects: Project[];
}

export interface JobDisplayProps {
  selectedJob: job;
}

export interface Job {
  imageUrl: string;
  company: string;
  link: string;
  jobKey: string; // Must match JobDescription
}

export interface JobDescription {
  title: string;
  duration: string;
  skills: string;
  description: string[];
  image: string;
}

export interface Project {
  imageUrl: string;
  projectName: string;
  projectKey: string;
}

export interface Education {
  educationKey: string;
  title: string;
  description: string;
  imageUrl: string;
  sections: string[];
}

// Define an interface for the style object
export interface BubbleStyle {
  top: string;
  left: string;
}

// Define an interface for the Bubble component props
export interface BubbleProps {
  key: React.Key;
  style: BubbleStyle;
  imageUrl?: string; // Optional image URL
  onBubbleClick: () => void;
}

// Define an interface for the bubble data and PersonalSection props
export interface BubbleData {
  id: number | string;
  style: BubbleStyle;
}

export interface PersonalSectionProps {
  bubblesData: BubbleData[];
}
