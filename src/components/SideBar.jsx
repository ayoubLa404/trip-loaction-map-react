import Logo from './Logo';
import AppNav from './AppNav';
import styles from './sidebar.module.css';
import { Outlet } from 'react-router-dom';

export default function SideBar() {
  return (
    <div className={styles.sidebar}>
      <Logo />
      {/* this is the nav btw cities and countries */}
      <AppNav />
      {/* this is cities || countries content from app route */}
      <Outlet />

      <footer className={styles.footer}>
        <p className={styles.copyright}>
          &copy; Copyright {new Date().getFullYear()} by No One
        </p>
      </footer>
    </div>
  );
}
