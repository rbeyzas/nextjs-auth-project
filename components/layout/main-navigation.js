import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import classes from './main-navigation.module.css';

function MainNavigation() {
  const { data: session, loading } = useSession();
  const isLoggedIn = !!session;

  function logoutHandler() {
    signOut(); // bu fonk. cookileri temizler ve kullanıcıyı oturumdan çıkarır
    console.log('User logged out');
  }

  return (
    <header className={classes.header}>
      <Link href="/">
        <div className={classes.logo}>Next Auth</div>
      </Link>
      <nav>
        <ul>
          {!isLoggedIn && !loading && (
            <li>
              <Link href="/auth">Login</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <Link href="/profile">Profile</Link>
            </li>
          )}
          {isLoggedIn && (
            <li>
              <button onClick={logoutHandler}>Logout</button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
