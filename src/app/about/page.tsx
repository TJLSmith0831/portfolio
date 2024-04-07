'use client';
import React, { useState, FC, useEffect, useRef } from 'react';
import { List, Steps, StepsProps } from 'antd';
import NavBar from '../standardUtils/NavBar';
import styles from '@/app/page.module.css';
import aboutStyles from '@/app/styles/About.module.css';
import { JobCardInfo } from './career/JobUtils';
import CareerDeck from './career/CareerDeck';
import JobDisplay from './career/JobDisplay';
import { BubbleData, Education, Job } from '../types/about';
import ProjectGrid from './projects/ProjectGrid';
import { ProjectCards } from './projects/ProjectUtils';
import PersonalLifeBubbles from './personal/PersonalLifeBubbles';
import { PersonalLifeInfo } from './personal/PersonalLifeUtils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsapFadeInRight } from '../standardUtils/gsapUtils';

const { Step } = Steps;

gsap.registerPlugin(ScrollTrigger);

const About: FC = () => {
  const [progressMark, setProgressMark] = useState<number>(0); // TODO: Track via scroll
  const [selectedJob, setSelectedJob] = useState<Job | null>(JobCardInfo[0]);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  const aboutMeRef = useRef(null);
  useGsapFadeInRight(aboutMeRef); // Fade in on load

  // TODO: Add animations on scrollTrigger for remaining components

  // Make header fade out on scroll
  // TODO: Eventually replace with way to keep steps in view
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

  const AboutMeSection = () => {
    return (
      <div
        className={aboutStyles.introduction}
        id="about-me"
        style={{
          willChange: 'transform, opacity',
          display: 'flex',
          alignItems: 'flex-start',
        }}
        ref={aboutMeRef}
      >
        <div style={{ flex: 1 }}>
          <img
            src="/hawaii.jpg" // TODO: Replace with more professional photo
            alt="A relevant description"
            style={{ width: '70%', height: '70%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, color: 'white' }}>
          <p>
            I am a developer based in Austin, TX, with a diverse skill set
            cultivated over four years of experience in the tech industry. My
            journey began in Data Science, where I developed a strong foundation
            in analytical thinking and problem-solving. This background has been
            invaluable as I transitioned into a hybrid role as a Front-end
            Engineer at PILYTIX. This unique blend of skills allows me to
            approach development projects with a holistic perspective, ensuring
            that both the data-driven backend and the user-facing frontend work
            seamlessly together to create intuitive and impactful digital
            solutions.
          </p>
          <br />
          <p>
            My mission is to continually expand my expertise across the full
            spectrum of development, aspiring to become a seasoned Full-stack
            Developer. I am committed to bridging the gap between complex
            data-driven algorithms and user-centric front-end design, aiming to
            craft digital solutions that are not only innovative and efficient
            but also accessible and meaningful to users. By embracing the
            challenges of both backend and frontend development, I seek to play
            a pivotal role in creating technology that positively impacts our
            world, driving forward with the curiosity of a Data Scientist and
            the creativity of a Front-end Engineer.
          </p>
        </div>
      </div>
    );
  };

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
        <ProjectGrid projects={ProjectCards} />
      </>
    );
  };

  const EducationSection = () => {
    // Assuming trinityEducation should be an array of items for the List component
    const trinityEducation = [
      {
        educationKey: 'trinity',
        title: 'Trinity University (2018 - 2022)',
        description: "Bachelor's of Science in Business Analytics & Technology",
        imageUrl:
          'https://imageio.forbes.com/specials-images/imageserve/559ebf9be4b05c2c3431c7ae/0x0.jpg?format=jpg&crop=416,416,x0,y0,safe&height=200&width=200&fit=bounds',
        sections: [
          {
            title: 'Honors',
            items: [
              'Minor in Sports Management',
              '3.93 Cumulative GPA',
              'Beta Gamma Sigma Honor Society',
            ],
          },
          {
            title: 'Certifications',
            items: [
              'Tableau Desktop Specialist (Dec 2020)',
              'Microsoft Excel Expert Certification (Nov 2019)',
            ],
          },
          {
            title: 'Delta Sigma Pi - Pi Omega',
            items: [
              'Chapter President (Dec 2020 - Dec 2021)',
              'Vice President of Professional Activities (Dec 2019 - Dec 2020)',
            ],
          },
        ],
      },
    ];

    return (
      <div className={aboutStyles.educationSection}>
        <List
          itemLayout="vertical"
          size="large"
          // pagination={{ onChange: (page) => { console.log(page); }, pageSize: 3, }}
          dataSource={trinityEducation}
          renderItem={(education) => (
            <List.Item
              key={education.educationKey}
              style={{
                backgroundColor: 'white',
                width: '50vw',
                marginBottom: '10px',
                borderRadius: '1%',
              }}
              extra={<img width={272} alt="logo" src={education.imageUrl} />}
            >
              <List.Item.Meta
                title={education.title}
                description={education.description}
              />
              {education.sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3>{section.title}</h3>
                  <ul>
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} style={{ marginLeft: '15px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </List.Item>
          )}
        />
      </div>
    );
  };

  const PersonalSection = () => {
    // Enhance PersonalLifeInfo with random positions
    const bubblesData: BubbleData[] = PersonalLifeInfo.map((info) => ({
      id: info.id,
      imageUrl: info.imageUrl,
      style: {
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`,
      },
    }));

    return <PersonalLifeBubbles bubblesData={bubblesData} />;
  };

  return (
    <div className={styles.main}>
      <div
        className={aboutStyles.fixedHeader}
        style={{ opacity: headerOpacity }}
      >
        <NavBar />
        {/* <div className={aboutStyles.titleBar}>
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
        </div> */}
      </div>
      <div className={aboutStyles.scrollableContent}>
        <AboutMeSection />
        <CareerSection />
        <ProjectsSection />
        <EducationSection />
        <PersonalSection />
      </div>
    </div>
  );
};

export default About;
