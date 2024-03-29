export interface CareerDeckProps {
  jobs: Job[];
}

export interface Job {
  imageUrl: string;
  company: string;
  link: string;
}

export interface JobDescription {
  title: string;
  duration: string;
  skills: string;
  description: Array[];
  image: string;
}
