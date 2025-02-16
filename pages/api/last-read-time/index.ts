import { NextApiRequest, NextApiResponse } from 'next';
import { upsertLastReadTime } from '../../../models/lastReadTime';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        await handleGET(req, res);
        break;
      }
      case 'POST': {
        await handlePOST(req, res);
        break;
      }
      case 'PUT': {
        await handlePOST(req, res);
        break;
      }
      default: {
        res.setHeader('Allow', 'GET, POST, PUT');
        res
          .status(405)
          .json({ error: { message: `Method ${method} Not Allowed` } });
      }
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, teamId, channelId } = req.query;

  if (!userId || !channelId) {
    return res.status(400).json({ error: 'userId and channelId are required' });
  }

  try {
    const lastReadTime = await prisma.lastReadTime.findUnique({
      where: {
        userId_teamId_channelId: {
          userId: userId as string,
          teamId: teamId as string,
          channelId: channelId as string,
        },
      },
    });

    if (!lastReadTime) {
      return res.status(404).json({ error: 'LastReadTime not found' });
    }

    res.status(200).json(lastReadTime);
  } catch (error) {
    console.error('Failed to fetch last read time:', error);
    res
      .status(500)
      .json({ error: { message: 'Failed to fetch last read time' } });
  }
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, channelId, teamId } = req.body;

    if (!userId || !channelId || !teamId) {
      return res
        .status(400)
        .json({ error: 'userId, channelId, and teamId are required' });
    }

    const result = await upsertLastReadTime({
      userId,
      channelId,
      teamId,
      lastReadTime: new Date(),
    });

    res.status(200).json({ data: result });
  } catch (error) {
    console.error('Failed to save last read time:', error);
    res
      .status(500)
      .json({ error: { message: 'Failed to save last read time' } });
  }
};
