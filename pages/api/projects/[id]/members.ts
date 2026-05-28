import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projectId = req.query.id as string;

    switch (req.method) {
      case 'GET':
        await handleGET(projectId, res);
        break;
      case 'POST':
        await handlePOST(projectId, req, res);
        break;
      case 'DELETE':
        await handleDELETE(projectId, req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

// GET — list all members of a project
const handleGET = async (projectId: string, res: NextApiResponse) => {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  res.status(200).json({ data: members });
};

// POST — add a team member to this project (by userId)
const handlePOST = async (projectId: string, req: NextApiRequest, res: NextApiResponse) => {
  const { userId, userName, userEmail, role } = req.body;

  if (!userId || !userEmail) {
    res.status(400).json({ error: { message: 'userId and userEmail are required.' } });
    return;
  }

  // Check if already a project member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (existing) {
    res.status(400).json({ error: { message: 'This user is already a member of the project.' } });
    return;
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId,
      userName: userName || userEmail,
      userEmail,
      role: role || 'MEMBER',
    },
  });

  res.status(200).json({ data: member });
};

// DELETE — remove a member from the project
const handleDELETE = async (projectId: string, req: NextApiRequest, res: NextApiResponse) => {
  const { memberId } = req.query;

  if (!memberId) {
    res.status(400).json({ error: { message: 'memberId is required.' } });
    return;
  }

  await prisma.projectMember.delete({
    where: { id: String(memberId) },
  });

  res.status(200).json({ message: 'Member removed from project.' });
};
