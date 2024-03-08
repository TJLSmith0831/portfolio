"use client";
import React from 'react';
import { Button, Typography } from 'antd';
import styles from '@/app/styles/NavBar.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { NavButtonProps } from '../types/navigation';

/**
 * NavButton component: Renders a navigation button.
 * 
 * The button's appearance changes based on the current route, indicating
 * if the button's destination matches the current page.
 * 
 * Props:
 * - name (string): The text to display on the button.
 * - href (string): The destination path for the button.
 */
const NavButton: React.FC<NavButtonProps> = ({ name, href }) => {
  const router = useRouter()
  const pathname = usePathname();
  const selected = pathname === href

  const handleNavigate = () => {
    router.push(href)
  }

  return (
    <Button className={selected ? styles.navButtonActive : styles.navButton} onClick={handleNavigate}>
      {name}
    </Button>
  )
}

/**
 * NavBar component: Renders the navigation bar with multiple NavButton components.
 * 
 * Displays a title and a series of NavButtons for different sections of the site.
 */
const NavBar = () => {
  return (
    <div className={styles.navigation}>
      <Typography className={styles.title}>TRISTAN SMITH</Typography>
      <div className={styles.navButtons}>
        <NavButton name={'Home'} href={'/'}/>
        <NavButton name={'About'} href={'/about'}/>
        <NavButton name={'Blog'} href={'/blog'}/>
        <NavButton name={'Contact'} href={'/contact'}/>
      </div>
    </div>
  );
};

export default NavBar;
