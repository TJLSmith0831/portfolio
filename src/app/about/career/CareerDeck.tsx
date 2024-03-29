import { CareerDeckProps, Job } from '@/app/types/about';
import { Card } from 'antd';
import Meta from 'antd/es/card/Meta';
import { useState } from 'react';
import aboutStyles from '@/app/styles/About.module.css';

const formatUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
};

const CareerCard: React.FC<{ job: Job; onClick: () => void }> = ({
  job,
  onClick,
}) => {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.stopPropagation();
  };

  return (
    <Card
      onClick={onClick}
      cover={
        <div
          style={{
            height: '10rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={job.imageUrl}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              height: 'auto',
              width: 'auto',
            }}
            alt={`${job.company} logo`}
          />
        </div>
      }
      className={aboutStyles.mediumCard}
    >
      <Meta
        title={job.company}
        description={
          <a
            href={formatUrl(job.link)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            {job.link}
          </a>
        }
      />
    </Card>
  );
};

const CareerDeck: React.FC<CareerDeckProps> = ({ jobs }) => {
  const [orderedJobs, setOrderedJobs] = useState<Job[]>(jobs);

  const handleClick = (index: number) => {
    setOrderedJobs((currentJobs) => {
      const newOrderedJobs = [...currentJobs];
      const [selectedJob] = newOrderedJobs.splice(index, 1);
      newOrderedJobs.unshift(selectedJob);
      return newOrderedJobs;
    });
  };

  return (
    <div className={aboutStyles.careerDeck}>
      {orderedJobs.map((job, index) => (
        <CareerCard key={index} job={job} onClick={() => handleClick(index)} />
      ))}
    </div>
  );
};

export default CareerDeck;
