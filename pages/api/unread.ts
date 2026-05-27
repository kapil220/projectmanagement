import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, channel_id, last_read_time } = req.query;

  if (req.method === 'GET') {
    if (!user_id || !channel_id || !last_read_time) {
      return res.status(400).json({ error: 'Missing required parameters user_id, channel_id, and last_read_time' });
    }

    try {
      const unreadCount = await prisma.chatHistory.count({
        where: {
          chat_id: String(channel_id),
          sender_id: { not: String(user_id) },
          timestamp: { gt: new Date(String(last_read_time)) },
        },
      });

      res.status(200).json({ unreadCount, channel_id });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
