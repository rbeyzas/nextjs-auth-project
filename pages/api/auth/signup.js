import { connectDatabase } from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const data = req.body;
  const { email, password } = data;

  if (!data.email || !data.password) {
    return res.status(422).json({ message: 'Invalid input' });
  }

  if (!email.includes('@') || password.trim().length < 7) {
    return res.status(422).json({ message: 'Invalid email or password' });
  }

  const client = await connectDatabase();

  try {
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email: email });

    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.collection('users').insertOne({
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created!', userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}

export default handler;
