
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import { NextApiRequest, NextApiResponse } from 'next';
import { chatGroupSchema } from '@/lib/zod';
import { recordMetric } from '@/lib/metrics';
import { group } from 'models/chatGroup';
import { prisma } from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET': {
                /*   const { action } = req.query;
           
                   if (action === 'projectId') {
                     await getSingleProject(req, res);
                   } else { */
                await handleGET(req, res);
                //   }
                break;
            }
            case 'POST': {
                await handlePOST(req, res);
                break;
            }
          case 'DELETE': {
                await handleDELETE(req, res);
                break;
            }
           case 'PUT': {
                await handlePUT(req, res);
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
        const groupList = await prisma?.chatGroup.findMany();
        console.log("chat group List==>>", groupList);
        recordMetric('chatGroup.fetched');

        res.status(200).json({ data: groupList });
    } catch (error) {
        res.status(500).json({ error: { message: 'Failed to fetch groupList' } });
    }
};

// Create a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { groupName, user_id, status, teamId } = chatGroupSchema.parse(req.body);

        console.log('Received Data:', { groupName, user_id, status, teamId });

        const result = await group({
            groupName,
            user_id,
            status,
            teamId
        });
        console.log("Result in save project---", result);
        recordMetric('chatGroup.created');

        res.status(200).json({ data: result });
    } catch (error) {
        console.log("Error in save chat group", error);

        res.status(500).json({ error: { message: 'Failed to save chat group' } });
    }
};

// Delete a project
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    console.log("id in delete fun.===", req.query);

    if (!id) {
        res.status(400).json({ error: { message: 'Invalid ID' } });
        return;
    }

    try {
        await prisma.chatGroup.delete({
            where: { id: String(id) }
        });

        recordMetric('chatGroup.deleted');
        console.log(`chat group with ID ${id} deleted successfully======`);

        res.status(200).json({ message: 'chat group deleted successfully' });
    } catch (error) {
        console.log("Error to delete chat group:", error);
        res.status(500).json({ error: { message: 'Failed to delete chat group' } });
    }
};

// Update a project
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id || Array.isArray(id)) {
        res.status(400).json({ error: { message: 'Invalid ID' } });
        return;
    }
    try {
        const updatedGroup = await prisma?.chatGroup.update({
            where: { id: String(id) },
            data: { status: false }
        });        
        recordMetric('chatGroup.updated');
        res.status(200).json({ message: 'Chat group status updated successfully', group: updatedGroup });
    } catch (error) {
        console.log("Error updating chatgroup:", error);
        res.status(500).json({ error: { message: 'Failed to update chat group status' } });
    }
};

// Get a single project by ID
const getSingleProject = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: String(id) },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};