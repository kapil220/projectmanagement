import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channelId } = req.query;
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const activeChannelId = String(channelId);
  const currentUserId = session.user.id;

  if (req.method === 'GET') {
    try {
      const messages = await prisma.chatHistory.findMany({
        where: { chat_id: activeChannelId },
        orderBy: { timestamp: 'asc' },
      });

      const userIds = Array.from(new Set(messages.map((m) => m.sender_id)));
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u.name]));

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        user: msg.sender_id === currentUserId ? 'You' : (userMap.get(msg.sender_id) || 'Unknown'),
        type: 'text',
        message: msg.message,
        timestamps: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(msg.timestamp).toISOString().split('T')[0],
        sender: msg.sender_id,
        receiver: msg.receiver_id,
        channel_id: msg.chat_id,
        createdAt: msg.createdAt,
      }));

      res.status(200).json(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    try {
      // Ensure the parent Chat room exists
      await prisma.chat.upsert({
        where: { id: activeChannelId },
        update: {
          lastMessage: message,
          lastMessageDate: new Date(),
        },
        create: {
          id: activeChannelId,
          room_id: activeChannelId,
          sender_id: currentUserId,
          receiver_id: activeChannelId,
          lastMessage: message,
          lastMessageDate: new Date(),
        },
      });

      // Create the ChatHistory record
      const uniqueId = uuidv4();
      const chatMessage = await prisma.chatHistory.create({
        data: {
          id: uniqueId,
          sender_id: currentUserId,
          chat_id: activeChannelId,
          receiver_id: activeChannelId,
          message: message,
          timestamp: new Date(),
        },
      });

      const formattedMessage = {
        id: chatMessage.id,
        user: 'You',
        type: 'text',
        message: chatMessage.message,
        timestamps: new Date(chatMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(chatMessage.timestamp).toISOString().split('T')[0],
        sender: chatMessage.sender_id,
        receiver: chatMessage.receiver_id,
        channel_id: chatMessage.chat_id,
        createdAt: chatMessage.createdAt,
      };

      res.status(200).json(formattedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to store message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
