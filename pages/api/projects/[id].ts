/* eslint no-use-before-define: 0 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { validateWithSchema, deleteProjectSchema, 
  //updateProjectSchema 
} from '@/lib/zod';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {
    const id = req.query.id as string; 

    switch (req.method) {
      case 'GET':
        await handleGET(id, req, res);
        break;
      case 'PUT':
        await handlePUT(id, req, res);
        break;
      case 'DELETE':
        await handleDELETE(id, req, res);
        break;
      default:
        res.setHeader('Allow', ['DELETE', 'PUT']);
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

//Update project
const handlePUT = async (
  id: string, 
  req: NextApiRequest, 
  res: NextApiResponse) => {
/*  try {
    const validatedData = validateWithSchema(updateProjectSchema, req.body);

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json({ message: 'Project updated successfully', data: updatedProject });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message || 'Invalid request' } });
  }*/
};

// Delete Project
const handleDELETE = async (id: string, req: NextApiRequest, res: NextApiResponse) => {
  const { id: projectId } = validateWithSchema(deleteProjectSchema, { id });

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    res.status(404).json({ error: { message: 'Project not found' } });
    return;
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  res.status(200).json({ message: 'Project deleted successfully' });
};

// Get project by ID
const handleGET = async (id: string, req: NextApiRequest, res: NextApiResponse) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }

    res.status(200).json({ data: project });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message || 'Invalid request' } });
  }
};


