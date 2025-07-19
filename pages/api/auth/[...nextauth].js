import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDatabase } from '../../../lib/db';
import { verifyPassword } from '../../../lib/auth';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Login attempt for:', credentials.email);

        const client = await connectDatabase();

        try {
          const userCollection = client.db().collection('users');
          const user = await userCollection.findOne({ email: credentials.email });

          console.log('User found:', !!user);

          if (!user) {
            console.log('No user with email:', credentials.email);
            return null;
          }

          console.log('🔑 Verifying password...');
          console.log('Input password:', credentials.password);
          console.log('Stored hash:', user.password);

          const isValid = await verifyPassword(credentials.password, user.password);

          console.log('Password valid:', isValid);

          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        } finally {
          await client.close();
        }
      },
    }),
  ],
});
