'use client';
import React, { useState, FC } from 'react';
import { Steps, StepsProps } from 'antd';
import NavBar from '../standardUtils/NavBar';
import styles from '@/app/page.module.css';
import aboutStyles from '@/app/styles/About.module.css';
import { JobCardInfo } from './career/JobUtils';
import CareerDeck from './career/CareerDeck';

const { Step } = Steps;

const About: FC = () => {
  const [progressMark, setProgressMark] = useState<number>(0);

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
  // TODO: Make CustomSteps component
  // TODO: Make AntCustomComponents file

  return (
    <div className={styles.main}>
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
          <Step title={<span style={{ color: 'gray' }}>Personal Life</span>} />
        </Steps>
      </div>
      <div className={aboutStyles.aboutContent}>
        <CareerDeck jobs={JobCardInfo} />
        <div className={aboutStyles.cardDisplay}></div>
      </div>
    </div>
  );
};

export default About;
