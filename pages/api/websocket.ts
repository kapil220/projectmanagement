// src/pages/api/websocket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const wsUrl = 'ws://localhost:9008';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('WebSocket connection opened');
});

ws.on('error', (err) => {
  console.error('WebSocket connection error:', err);
});

async function generateUniqueUserId() {
  return uuidv4();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;
  console.log(req.body, "Body");

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    switch (data.action) {
      case 'join': {
        const joinUserId = data.sender_id || await generateUniqueUserId();
        const roomId = uuidv4(); // Generate a unique room ID if not provided

        await prisma.chat.upsert({
          where: { id: roomId },
          update: {
            room_id: roomId,
            sender_id: joinUserId,
            receiver_id: data.receiver_id,
            lastMessage: "",
            lastMessageDate: new Date(),
          },
          create: {
            id: roomId,
            room_id: roomId,
            sender_id: joinUserId,
            receiver_id: data.receiver_id,
            lastMessage: "",
            lastMessageDate: new Date(),
          },
        });

        ws.send(JSON.stringify({
          action: 'join',
          sender_id: joinUserId,
          room_id: roomId,
          receiver_id: data.receiver_id,
          lastMessage: "",
          lastMessageDate: new Date(),
        }), (err) => {
          if (err) {
            console.error('Error sending join action to WebSocket server:', err);
            return res.status(500).json({ error: 'Error sending join action to WebSocket server' });
          }
          return res.status(200).json({ message: 'Join action processed and sent to WebSocket server', data });
        });
        break;
      }

      case 'disconnect': {
        const disconnectUserId = data.sender_id;

        if (!disconnectUserId) {
          return res.status(400).json({ error: 'UserId is required for disconnect action' });
        }

        ws.send(JSON.stringify({
          action: 'disconnect',
          sender_id: disconnectUserId,
          room_id: data.room_id,
        }), (err) => {
          if (err) {
            console.error('Error sending disconnect action to WebSocket server:', err);
            return res.status(500).json({ error: 'Error sending disconnect action to WebSocket server' });
          }
          return res.status(200).json({ message: 'Disconnect action processed and sent to WebSocket server', data });
        });
        break;
      }

      case 'sendmessage': {
        const sendMessageUserId = data.sender_id;

        if (!sendMessageUserId) {
          return res.status(400).json({ error: 'UserId is required for sendmessage action' });
        }

        const chat = await prisma.chat.findFirst({
          where: {
            sender_id: sendMessageUserId,
            receiver_id: data.receiver_id,
          },
        });

        if (!chat) {
          throw new Error('Chat room not found');
        }

        const uniqueId = await generateUniqueUserId();

        await prisma.chatHistory.create({
          data: {
            id: uniqueId,
            sender_id: sendMessageUserId,
            chat_id: chat.id,
            receiver_id: data.receiver_id,
            message: data.message,
            timestamp: new Date(),
          },
        });

        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            lastMessage: data.message,
            lastMessageDate: new Date(),
          },
        });

        ws.send(JSON.stringify({
          action: 'sendmessage',
          sender_id: sendMessageUserId,
          room_id: chat.id,
          receiver_id: data.receiver_id,
          message: data.message,
        }), (err) => {
          if (err) {
            console.error('Error sending message to WebSocket server:', err);
            return res.status(500).json({ error: 'Error sending message to WebSocket server' });
          }
          return res.status(200).json({ message: 'Message processed and sent to WebSocket server', data });
        });
        break;
      }

      default: {
        return res.status(400).json({ error: 'Unknown action' });
      }
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
