import { Server } from 'ws';
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import ChatMessage from '../../../models/chatMessage';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      ws?: Server;
      on: (event: string, listener: (req: any, socket: any, head: any) => void) => void;
    };
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  console.log('Initializing WebSocket server...');
  if (!res.socket.server.ws) {
    console.log('Initializing WebSocket server...');

    const wsServer = new Server({ noServer: true });
    res.socket.server.ws = wsServer;
    res.socket.server.on('upgrade', (req, socket, head) => {
      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit('connection', ws, req);
      });
    });
    wsServer.on('connection', (ws) => {
      ws.on('message', async (data) => {
        const { username, message } = JSON.parse(data.toString());

        if (username && message) {
          await connectToDatabase();
          const chatMessage = new ChatMessage({ username, message });
          await chatMessage.save();

          wsServer.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify(chatMessage));
            }
          });
        }
      });
    });

    res.socket.server.ws = wsServer;
  }

  res.status(200).end();
}
