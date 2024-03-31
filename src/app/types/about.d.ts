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
