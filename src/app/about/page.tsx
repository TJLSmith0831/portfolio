'use client';
import React, { useState, FC, useEffect } from 'react';
import { Steps, StepsProps } from 'antd';
import NavBar from '../standardUtils/NavBar';
import styles from '@/app/page.module.css';
import aboutStyles from '@/app/styles/About.module.css';
import { JobCardInfo } from './career/JobUtils';
import CareerDeck from './career/CareerDeck';
import JobDisplay from './career/JobDisplay';
import { Job } from '../types/about';

const { Step } = Steps;

const About: FC = () => {
  const [progressMark, setProgressMark] = useState<number>(0); // TODO: Track via scroll
  const [selectedJob, setSelectedJob] = useState<Job | null>(JobCardInfo[0]);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  // Make header fade out on scroll
  useEffect(() => {
    const onScroll = () => {
      const newOpacity = Math.max(0, 1 - window.scrollY / 300); // Adjust to control the fade speed
      setHeaderOpacity(newOpacity);
    };

    // Add scroll event listener
    window.addEventListener('scroll', onScroll);

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Define the custom dot style type
  const customDot = (
    dot: React.ReactNode,
    { status, index }: { status: StepsProps['status']; index: number }
  ): React.ReactNode => (
    <span
      style={{
        position: 'relative',
      }}
    >
      <span
        style={{
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor:
            status === 'finish' || status === 'process'
              ? '#23D18B'
              : 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      />
    </span>
  );

  // Displays CareerDeck and JobDisplay
  const CareerSection = () => {
    return (
      <>
        <div className={aboutStyles.careerSection}>
          <CareerDeck jobs={JobCardInfo} setSelectedJob={setSelectedJob} />
          <JobDisplay selectedJob={selectedJob} />
        </div>
      </>
    );
  };

  const ProjectsSection = () => {
    return (
      <>
        <div className={aboutStyles.projectsSection}></div>
      </>
    );
  };

  const EducationSection = () => {
    return (
      <>
        <div className={aboutStyles.projectsSection}>EDUCATION</div>
      </>
    );
  };

  const PersonalSection = () => {
    return (
      <>
        <div className={aboutStyles.projectsSection}>PERSONAL LIFE</div>
      </>
    );
  };

  return (
    <div className={styles.main}>
      <div
        className={aboutStyles.fixedHeader}
        style={{ opacity: headerOpacity }}
      >
        <NavBar />
        <div className={aboutStyles.titleBar}>
          <h1 className={aboutStyles.titleHeader}>ABOUT</h1>
          <Steps
            current={progressMark}
            progressDot={customDot}
            className={aboutStyles.customSteps}
            style={{ alignSelf: 'center', marginTop: '3%' }}
          >
            <Step title={<span style={{ color: 'white' }}>Career</span>} />
            <Step title={<span style={{ color: 'gray' }}>Projects</span>} />
            <Step title={<span style={{ color: 'gray' }}>Education</span>} />
            <Step
              title={<span style={{ color: 'gray' }}>Personal Life</span>}
            />
          </Steps>
        </div>
      </div>
      <div className={aboutStyles.scrollableContent}>
        <CareerSection />
        <ProjectsSection />
        <EducationSection />
        <PersonalSection />
      </div>
    </div>
  );
};

export default About;
