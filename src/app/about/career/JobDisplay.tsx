import { JobDescription, JobDisplayProps } from '@/app/types/about';
import aboutStyles from '@/app/styles/About.module.css';
import { Avatar, List } from 'antd';
import { JobDescriptions } from './JobUtils';

const JobDisplay: React.FC<JobDisplayProps> = ({ selectedJob }) => {
  // Get selectedJobDescription using selectedJob
  const selectedJobDescription: JobDescription[] =
    JobDescriptions[selectedJob.jobKey];

  return (
    <div>
      <List
        itemLayout="vertical"
        size="large"
        // pagination={{
        //   onChange: (page) => {
        //     console.log(page);
        //   },
        //   pageSize: 3,
        // }}
        dataSource={selectedJobDescription}
        renderItem={(job: JobDescription) => (
          <List.Item
            key={job.title}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent background for glass effect
              backdropFilter: 'blur(10px)', // Blur effect for the elements behind the card
              WebkitBackdropFilter: 'blur(10px)', // For Safari
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Enhanced shadow for depth
              border: '1px solid rgba(255, 255, 255, 0.18)', // Subtle border for a glassy edge
              width: '45vw',
              maxWidth: '650px',
              minWidth: '550px',
              marginBottom: '15px',
              borderRadius: '1%',
              transform: 'translateZ(0) scale(1.05)', // Slight scale-up for 3D "pop"
              transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out', // Smooth transition for hover effects
            }}
          >
            <List.Item.Meta
              title={job.title}
              description={
                <>
                  {`Skills: ${job.skills}`}
                  <br />
                  {job.duration}
                </>
              }
            />
            <ul>
              {job.description.map((desc, index) => (
                <li style={{ marginLeft: '15px' }} key={index}>
                  {desc}
                </li>
              ))}
            </ul>
          </List.Item>
        )}
      />
    </div>
  );
};

export default JobDisplay;
