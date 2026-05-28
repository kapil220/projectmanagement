import { NextApiRequest, NextApiResponse } from 'next';
import { projectSchema } from '@/lib/zod';
import { recordMetric } from '@/lib/metrics';
import { project } from 'models/project';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { action } = req.query;

        if (action === 'projectId') {
          await getSingleProject(req, res);
        } else {
          await handleGET(req, res);
        }
        break;
      }
      case 'POST': {
        await handlePOST(req, res);
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

// Get projects — with GUEST access filtering
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get current user's team membership to check if they are a GUEST
  const { teamId } = req.query as { teamId?: string };
  const userId = (req as any).session?.user?.id;

  // Try to detect if the requester is a GUEST by checking their TeamMember role
  let guestProjectIds: string[] | null = null;
  if (userId && teamId) {
    const membership = await prisma.teamMember.findFirst({
      where: { userId, teamId },
      select: { role: true },
    });
    if (membership?.role === 'GUEST') {
      // Only fetch projects this guest is a member of
      const guestProjects = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      guestProjectIds = guestProjects.map((p) => p.projectId);
    }
  }

  // Fetch projects — filtered for GUESTs, all for full members
  const projects = await prisma.project.findMany({
    where: guestProjectIds !== null
      ? { id: { in: guestProjectIds } }
      : undefined,
  });

  // Get member counts in ONE query (no N+1)
  const memberCounts = await prisma.projectMember.groupBy({
    by: ['projectId'],
    _count: { userId: true },
    where: { projectId: { in: projects.map((p) => p.id) } },
  });

  const countMap = new Map(memberCounts.map((c) => [c.projectId, c._count.userId]));

  const projectListWithUserCount = projects.map((project) => ({
    ...project,
    userCount: countMap.get(project.id) ?? 0,
  }));

  recordMetric('projects.fetched');
  res.status(200).json({ data: projectListWithUserCount });
};


// Create a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectName, description, user_id, startDate, endDate, teamId } = projectSchema.parse(req.body);

  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;

  const result = await project({
    projectName,
    description,
    user_id,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    teamId
  });

  recordMetric('project.created');
  res.status(200).json({ data: result });
};


// Update a project
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: { message: 'Invalid ID' } });
    return;
  }

  const updatedProject = await prisma.project.update({
    where: { id: String(id) },
    data: { status: false }
  });

  recordMetric('project.updated');
  res.status(200).json({ data: updatedProject });
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
