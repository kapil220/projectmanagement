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

// Get projects
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Fetch all projects
    const projects = await prisma.project.findMany();

    // Fetch user count for each project
    const projectListWithUserCount = await Promise.all(
      projects.map(async (project) => {
        // Count the users associated with each project
        const userCount = await prisma.channelUsers.count({
          where: {
            channelId: project.id, // Assuming channelId in channelUsers maps to project id
          },
        });
        return {
          ...project,
          userCount,
        };
      })
    );

    console.log("projects List with user count==>>", projectListWithUserCount);
    recordMetric('projects.fetched');

    res.status(200).json({ data: projectListWithUserCount });
  } catch (error) {
    console.error('Failed to fetch projects with user counts:', error);
    res.status(500).json({ error: { message: 'Failed to fetch projects' } });
  }
/*  try {
    const projectList = await prisma?.project.findMany();
    console.log("projects List==>>", projectList);
    recordMetric('projects.fetched');

    res.status(200).json({ data: projectList });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch projects' } });
  }  */
};

// Create a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectName, description, user_id, startDate, endDate, teamId } = projectSchema.parse(req.body);

    console.log('Received Data:', { projectName, startDate, description, endDate, user_id, teamId });
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
    console.log("Result in save project---", result);
    recordMetric('project.created');

    res.status(200).json({ data: result });
  } catch (error) {
    console.log("Errore in save project", error);

    res.status(500).json({ error: { message: 'Failed to save project' } });
  }
};

// Update a project
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id ) {
    res.status(400).json({ error: { message: 'Invalid ID ' } });
    return;
  }

  try {
    const updatedProject = await prisma?.project.update({
      where: { id: String(id) },
      data: { status: false }
    });

    recordMetric('project.updated');
    console.log(`Project with ID ${id} updated successfully`);

    res.status(200).json({ data: updatedProject });
  } catch (error) {
    console.log("Error updating project:", error);
    res.status(500).json({ error: { message: 'Failed to update project' } });
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
