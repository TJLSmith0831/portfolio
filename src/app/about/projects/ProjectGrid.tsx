import { Project, ProjectGridProps } from '@/app/types/about';
import aboutStyles from '@/app/styles/About.module.css';
import { Card } from 'antd';
import Meta from 'antd/es/card/Meta';

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({
  project,
  onClick,
}) => {
  return (
    <Card
      hoverable={true}
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
            src={project.imageUrl}
            style={{
              maxHeight: '90%',
              maxWidth: '90%',
              height: 'auto',
              width: 'auto',
            }}
            alt={`${project.projectName}`}
          />
        </div>
      }
    >
      <Meta title={project.projectName} />
    </Card>
  );
};

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className={aboutStyles.projectsSection}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.projectKey}
          project={project}
          onClick={() => console.log('Flip')}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
