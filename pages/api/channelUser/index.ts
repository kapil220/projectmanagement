import { NextApiRequest, NextApiResponse } from 'next';
import { channelUserSchema } from '@/lib/zod';
import { recordMetric } from '@/lib/metrics';
import { prisma } from '@/lib/prisma';
import { createChannelUser } from 'models/channelUser';

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
            default: {
                res.setHeader('Allow', 'GET, POST, DELETE, PUT');
                res.status(405).json({
                    error: { message: `Method ${method} Not Allowed` },
                });
            }
        }
    } catch (error: any) {
        const message = error.message || 'Something went wrong';
        const status = error.status || 500;

        res.status(status).json({ error: { message } });
    }
}

// Get projects
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const channelUserList = await prisma?.channelUsers.findMany();
        console.log("channelUser List==>>", channelUserList);
        recordMetric('channelUser.fetched');
    
        res.status(200).json({ data: channelUserList });
      } catch (error) {
        res.status(500).json({ error: { message: 'Failed to fetch channelUser' } });
      }  
};

// Create a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { userId, channelId, teamId } = channelUserSchema.parse(req.body);

        console.log('Received Data:', { userId, channelId, teamId });
        const result = await createChannelUser({
            userId,
            channelId,
            teamId
        });
        console.log("Result in save channelUser---", result);
        recordMetric('channelUser.created');

        res.status(200).json({ data: result });
    } catch (error) {
        console.log("Error in save channelUser", error);

        res.status(500).json({ error: { message: 'Failed to save channelUser' } });
    }
};
