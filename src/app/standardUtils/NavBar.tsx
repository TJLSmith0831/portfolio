import React from 'react';
import { Button, Typography } from 'antd';
import styles from '@/app/styles/NavBar.module.css';

const NavBar = () => {
  // If you need the current route, you can get it using the useRouter hook from Next.js
  // const router = useRouter();
  // const currentRoute = router.pathname;

  return (
    <div className={styles.navigation}>
      <Typography className={styles.title}>TRISTAN SMITH</Typography>
      <div className={styles.navButtons}>
        <Button className={styles.navButtonActive} type="link" href="/home">
          Home
        </Button>
        <Button className={styles.navButton} type="link" href="/about">
          About
        </Button>
        <Button className={styles.navButton} type="link" href="/blog">
          Blog
        </Button>
        <Button className={styles.navButton} type="link" href="/contact">
          Contact
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
