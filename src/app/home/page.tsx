import React from 'react';
import NavBar from '../standardUtils/NavBar';
import styles from '@/app/page.module.css';
import homeStyles from '@/app/styles/Home.module.css';
import { Avatar } from 'antd';
import { FaInstagram, FaGithub, FaMedium, FaLinkedin } from 'react-icons/fa';

const HomeLinks = () => {
  return (
    <div className={homeStyles.homeLinks}>
      <a
        href="https://www.instagram.com/tjlsmith0831"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaInstagram className={homeStyles.homeLink} />
      </a>
      <a
        href="https://github.com/TJLSmith0831"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub className={homeStyles.homeLink} />
      </a>
      <a
        href="https://medium.com/@tjlsmith0831"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaMedium className={homeStyles.homeLink} />
      </a>
      <a
        href="https://www.linkedin.com/in/tristan-smith-666614158"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin className={homeStyles.homeLink} />
      </a>
    </div>
  );
};

const Home = () => {
  return (
    <div className={styles.main}>
      <NavBar />
      <div className={homeStyles.homeRectangleOuter}>
        <div className={homeStyles.homeRectangleInner}>
          <div className={homeStyles.homeBody}>
            <div className={homeStyles.callToAction}>
              <p className={homeStyles.callToActionLine1}>LEAD THE LEAGUE</p>
              <p className={homeStyles.callToActionLine2}>
                WITH FULL-STACK SOLUTIONS
              </p>
              <HomeLinks />
            </div>
            <Avatar
              shape="circle"
              src="/Profile.jpeg"
              className={homeStyles.avatarStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
