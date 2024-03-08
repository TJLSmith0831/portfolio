import React from 'react';
import styles from './page.module.css';
import NavBar from './standardUtils/NavBar';

export default function Home() {
  return (
    <div className={styles.main}>
      <NavBar />
    </div>
  );
}
