import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import ChatMessage from '../../../models/chatMessage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    console.log("In post");
    
    const { username, message } = req.body;
    console.log("req.body---",req.body);

    if (!username || !message) {
      return res.status(400).json({ error: 'Username and message are required' });
    }
    try {
      const chatMessage = new ChatMessage({ username, message });
      console.log("chatMessage---",chatMessage);
      
      await chatMessage.save();
      res.status(200).json(chatMessage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
