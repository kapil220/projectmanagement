/* eslint no-use-before-define: 0 */

import { NextApiRequest, NextApiResponse } from 'next';
//import { task } from '../../../models/task';
import { recordMetric } from '../../../lib/metrics';
import { prisma } from "../../../lib/prisma";
//import { taskSchema, validateWithSchema } from "../../../lib/zod";
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
          await getSingleProject(req, res)
        } else{
          await handleGET(req, res);
        }
        break;
      }
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
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
    const taskList = await prisma?.task.findMany();
    recordMetric('tasks.fetched');

    res.status(200).json({ data: taskList });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch tasks' } });
  }
};
/*
// Create a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, description, name, stage, dueDate, priority, assignee, tag, assignor, teamId } = validateWithSchema(taskSchema, req.body);
    //const { projectId, description,name, stage, date, priority, assignee, assignor,teamId } = task.parse(req.body);

    console.log('Received Data:', { projectId, name, priority, description, dueDate, stage, tag, teamId });
    const parsedDate = dueDate ? new Date(dueDate) : undefined;

    const result = await task({
      projectId: projectId || null,
      description,
      name,
      dueDate: parsedDate,
      stage,
      priority,
      assignee,
      assignor,
      teamId,
      tag
    });
    console.log("Result in save task---", result);
    recordMetric('task.created');

    res.status(200).json({ data: result });
  } catch (error) {
    console.log("Errore in save task", error);

    res.status(500).json({ error: { message: 'Failed to save task' } });
  }
};  */
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  console.log("id in delete fun.===", req.query);

  if (!id) {
    res.status(400).json({ error: { message: 'Invalid ID' } });
    return;
  }
  if (!prisma) {
    res.status(500).json({ error: { message: 'Prisma client not initialized' } });
    return;
  }
  try {
    await prisma.project.delete({
      where: { id: String(id) }
    });

    recordMetric('task.deleted');
    console.log(`task with ID ${id} deleted successfully======`);

    res.status(200).json({ message: 'task deleted successfully' });
  } catch (error) {
    console.log("Error to delete project:", error);
    res.status(500).json({ error: { message: 'Failed to delete project' } });
  }
};
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, projectName } = req.body;

  if (!id || !projectName) {
    res.status(400).json({ error: { message: 'Invalid ID or Project Name' } });
    return;
  }

  try {
    const updatedProject = await prisma?.project.update({
      where: { id: String(id) },
      data: { projectName }
    });

    recordMetric('project.updated');
    console.log(`Project with ID ${id} updated successfully`);

    res.status(200).json({ data: updatedProject });
  } catch (error) {
    console.log("Error updating project:", error);
    res.status(500).json({ error: { message: 'Failed to update project' } });
  }
};
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
}
