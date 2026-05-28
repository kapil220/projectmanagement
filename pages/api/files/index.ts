import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

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
      case 'DELETE': {
        await handleDELETE(req, res);
        break;
      }
      default: {
        res.setHeader('Allow', 'GET, POST, DELETE');
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

// Get files for a team/workspace
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { teamId, projectId } = req.query;

  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ error: { message: 'teamId is required' } });
  }

  try {
    const whereClause: any = { teamId };
    
    if (projectId && typeof projectId === 'string' && projectId !== 'all' && projectId !== 'undefined') {
      whereClause.projectId = projectId;
    }

    const files = await prisma.workspaceFile.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: files });
  } catch (error) {
    console.error('Failed to fetch files:', error);
    res.status(500).json({ error: { message: 'Failed to fetch files' } });
  }
};

// Create a file record
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, size, type, url, teamId, projectId, uploadedBy } = req.body;

    if (!name || !size || !type || !url || !teamId || !uploadedBy) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    const newFile = await prisma.workspaceFile.create({
      data: {
        name,
        size: Number(size),
        type,
        url,
        teamId,
        projectId: projectId || null,
        uploadedBy,
      },
    });

    res.status(200).json({ data: newFile });
  } catch (error) {
    console.error('Error creating file record:', error);
    res.status(500).json({ error: { message: 'Failed to create file' } });
  }
};

// Delete a file record
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: { message: 'File ID is required' } });
  }

  try {
    await prisma.workspaceFile.delete({
      where: { id },
    });

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file record:', error);
    res.status(500).json({ error: { message: 'Failed to delete file' } });
  }
};
