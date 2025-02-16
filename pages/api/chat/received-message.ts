import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import ChatMessage from '../../../models/chatMessage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(100);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
