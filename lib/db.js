import { MongoClient } from 'mongodb';

export async function connectDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  return client;
}
