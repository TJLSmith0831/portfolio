import { Project, ProjectGridProps } from '@/app/types/about';
import aboutStyles from '@/app/styles/About.module.css';
import { Card } from 'antd';
import Meta from 'antd/es/card/Meta';
import { useState } from 'react';

const ProjectCard: React.FC<{
  project: Project;
  onFlip: (flipped: boolean) => void;
}> = ({ project, onFlip }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    const flippedState = !isFlipped;
    setIsFlipped(flippedState);
    setIsExpanded(flippedState);
    onFlip(flippedState);
  };

  let cardClasses = `${aboutStyles.projectCard} ${isFlipped ? aboutStyles.flipped : ''} ${isExpanded ? aboutStyles.expanded : ''}`;

  return (
    <div className={aboutStyles.cardContainer}>
      <Card hoverable={true} onClick={handleCardClick} className={cardClasses}>
        <>
          {!isFlipped ? (
            <div className={aboutStyles.cardFront}>
              <img
                src={project.imageUrl}
                alt={`${project.projectName}`}
                style={{
                  maxHeight: '90%',
                  maxWidth: '90%',
                  height: 'auto',
                  width: 'auto',
                  marginBottom: '10%',
                }}
              />
            </div>
          ) : (
            <div className={aboutStyles.cardBack}>
              <div className={aboutStyles.title}>NexSportsAI</div>
              <div className={aboutStyles.content}>
                <p>Lead Developer & CEO</p>
                <p>
                  NexSportsAI was a passion project turned small business. Since
                  graduating high school in 2018, I've completed...
                </p>
                {/* ...more content as per the design */}
              </div>
              <div className={aboutStyles.additionalSection}>
                {/* Additional content like statistics or interactive elements */}
              </div>
            </div>
          )}
        </>
        {!isFlipped && <Meta title={project.projectName} />}
      </Card>
    </div>
  );
};

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleFlip = (flipped: boolean, projectKey: string) => {
    setExpandedCard(flipped ? projectKey : null);
  };

  // Style for the overlay
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
    display: expandedCard ? 'block' : 'none',
  };

  return (
    <>
      <div style={overlayStyle} onClick={() => setExpandedCard(null)} />
      <div className={aboutStyles.projectsSection}>
        {projects.map((project, index) => {
          const isExpanded = expandedCard === project.projectKey;
          const divStyle = isExpanded
            ? {
                position: 'fixed', // Fixed position for the expanded card's div
                top: '50%', // Center vertically
                left: '50%', // Center horizontally
                transform: 'translate(-50%, -50%)', // Adjust the positioning to center the div
                zIndex: 10, // Make sure it's above other elements
                visibility: 'visible',
              }
            : {
                position: 'relative',
                visibility: expandedCard && !isExpanded ? 'hidden' : 'visible',
              };

          return (
            <div key={project.projectKey} style={divStyle}>
              <ProjectCard
                project={project}
                onFlip={(flipped) => handleFlip(flipped, project.projectKey)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProjectGrid;
