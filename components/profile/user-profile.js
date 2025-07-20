import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProfileForm from './profile-form';
import classes from './user-profile.module.css';

function UserProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // Session yüklenene kadar bekle
  if (status === 'loading') {
    return <p className={classes.profile}>Loading...</p>;
  }

  // Authentication olmamışsa redirect
  if (status === 'unauthenticated') {
    return <p className={classes.profile}>Redirecting...</p>;
  }

  // Session yoksa hata göster
  if (!session || !session.user) {
    return <p className={classes.profile}>Session error. Please login again.</p>;
  }

  async function changePasswordHandler(passwordData) {
    const response = await fetch('/api/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log(data);
  }

  return (
    <section className={classes.profile}>
      <h1>Your User Profile</h1>
      <p>Welcome, {session.user.email}!</p>
      {isLoading ? (
        <p>Updating password...</p>
      ) : (
        <ProfileForm onChangePassword={changePasswordHandler} />
      )}
    </section>
  );
}

export default UserProfile;
