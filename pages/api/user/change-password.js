import { getToken } from 'next-auth/jwt';
import { connectDatabase } from '../../../lib/db';
import { hashPassword, verifyPassword } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // JWT token'ı farklı parametrelerle dene
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
  });

  console.log('Token in change-password API:', token); // Debug
  console.log('Cookies:', req.headers.cookie); // Debug cookies

  if (!token || !token.email) {
    console.log('No token found in change-password API'); // Debug
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword || newPassword.trim().length < 7) {
    return res
      .status(422)
      .json({ message: 'Invalid input - password must be at least 7 characters' });
  }

  const client = await connectDatabase();

  try {
    const userCollection = client.db().collection('users');
    const user = await userCollection.findOne({ email: token.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Eski şifreyi doğrula
    const isValid = await verifyPassword(oldPassword, user.password);

    if (!isValid) {
      return res.status(422).json({ message: 'Invalid old password' });
    }

    // Yeni şifreyi hash'le
    const hashedNewPassword = await hashPassword(newPassword);

    // Şifreyi güncelle
    await userCollection.updateOne(
      { email: token.email },
      { $set: { password: hashedNewPassword } },
    );

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}

export default handler;
