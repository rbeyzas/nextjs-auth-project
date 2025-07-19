import UserProfile from '../components/profile/user-profile';
import { getSession } from 'next-auth/react';
function ProfilePage() {
  return <UserProfile />;
}

export async function getServerSideProps(context) {
  // getSession otomatik olarak bu isteği inceleyecek ve oturum belirteci çerezinden ihtiyaç duyduğu verileri çıkaracak ve bunun geçerli olup olmadığına, kullanıcının kimliğinin doğrulanıp doğrulanmadığına ve bu çerezin başlangıçta var olup olmadığına bakacaktır.
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

export default ProfilePage;
