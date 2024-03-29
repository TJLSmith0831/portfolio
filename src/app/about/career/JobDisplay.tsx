import { JobDescription, JobDisplayProps } from '@/app/types/about';
import aboutStyles from '@/app/styles/About.module.css';
import { Avatar, List } from 'antd';
import { JobDescriptions } from './JobUtils';

const JobDisplay: React.FC<JobDisplayProps> = ({ selectedJob }) => {
  // Get selectedJobDescription using selectedJob
  const selectedJobDescription: JobDescription[] =
    JobDescriptions[selectedJob.jobKey];

  return (
    <div className={aboutStyles.cardDisplay}>
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
              backgroundColor: 'white',
              width: '45vw',
              maxWidth: '650px',
              minWidth: '550px',
              marginBottom: '10px',
              borderRadius: '1%',
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
