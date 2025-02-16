// server.ts
/*import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server } from 'ws';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const wss = new Server({ noServer: true });
  const ALLOWED_PATTERNS = [
    /^\/teams\/[^\/]+\/chats$/, // Matches /teams/{project}/chats
    // Add more patterns as needed
  ];
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log('received:', parsedMessage);
        if (parsedMessage.page && !isAllowedPage(parsedMessage.page)) {
          ws.send(JSON.stringify({ event: 'error', message: 'Not allowed from this page' }));
          ws.close();
          return;
        }  
        console.log('received:', parsedMessage);

        switch (parsedMessage.event) {
          case 'ping':
            ws.send(JSON.stringify({ event: 'pong' }));
            break;
          case 'chat':
            // Handle chat messages here
            console.log('Chat message:', parsedMessage);
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(parsedMessage));
              }
            });
            break;
          default:
            console.log('Unknown event type:', parsedMessage.event);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  const isAllowedPage = (page: string): boolean => {
    return ALLOWED_PATTERNS.some(pattern => pattern.test(page));
  };

  // Handle HTTP upgrade requests
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // Handle all HTTP requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  server.listen(4002, () => {
    console.log('> Ready on http://localhost:4002');
  });
});

/*
import express from 'express';
import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 9008;

app.use(express.json());

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocketServer({ server });
const prisma = new PrismaClient();

wss.on('connection', (ws) => {
  ws.on('message', async (message: string) => {
    const data = JSON.parse(message);
    console.log(data, 'Received data');

    try {
      const { action, senderId, roomId, receiverId, lastMessage, lastMessageDate, message: chatMessage } = data;

      if (!senderId || !roomId) {
        throw new Error('senderId and roomId are required');
      }

      switch (action) {
        case 'join':
          console.log('Processing join action');
          await prisma.chat.upsert({
            where: { id: roomId },
            update: {
              room_id: roomId,
              sender_id: senderId,
              receiver_id: receiverId,
              lastMessage,
              lastMessageDate: new Date(lastMessageDate),
            },
            create: {
              id: roomId,
              room_id: roomId,
              sender_id: senderId,
              receiver_id: receiverId,
              lastMessage,
              lastMessageDate: new Date(lastMessageDate),
            },
          });
          break;

        case 'disconnect':
          console.log('Processing disconnect action');
          await prisma.chat.delete({
            where: { id: roomId },
          });
          break;

        case 'sendmessage':
          console.log('Processing sendmessage action');
          const chat = await prisma.chat.findUnique({
            where: { id: roomId },
          });

          if (!chat) {
            throw new Error('Chat room not found');
          }

          await prisma.chatHistory.create({
            data: {
              sender_id: senderId,
              chat_id: roomId,
              receiver_id: receiverId,
              message: chatMessage,
              timestamp: new Date(),
            },
          });

          // Update the last message and last message date in the chat
          await prisma.chat.update({
            where: { id: roomId },
            data: {
              lastMessage: chatMessage,
              lastMessageDate: new Date(),
            },
          });

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
          break;

        default:
          console.error('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
*/