/* eslint no-use-before-define: 0 */
import { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { prisma } from '@/lib/prisma';
import axios from "axios";
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
          await getSingleUser(req, res);
        } else if( action === 'lastSeenTime') {
          await getRecentUser(req,res);
        } else {
          await handleGET(req, res);
        }
        break;
      }
      /*   case 'POST': {
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
         } */
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
const getRecentUser = async (req: NextApiRequest, res: NextApiResponse) => {
 const userId = Array.isArray(req.query.user_id) ? req.query.user_id[0] : req.query.user_id;

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  if (!userId) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  try {
    // Step 1: Find the maximum lastSeenTime channel-wise for the given user
    const lastSeenTimes = await prisma.lastReadTime.findMany({
      where: {
        userId: userId,
      },
      select: {
        channelId: true,
        lastReadTime: true,
      },
    });
    console.log("lastSeenTimes<<>>>>><><>",lastSeenTimes);

      const recentSenders: any[] = [];

      for (const record of lastSeenTimes) {
        console.log("Checking messages for channelId:", record.channelId);
        console.log("Checking messages for userId:", userId);
        console.log("Checking messages after:", record.lastReadTime);

        const response = await axios.get(`http://localhost:3000/api/unread?user_id=${userId}&channel_id=${record.channelId}&last_read_time=${record.lastReadTime}`);

        console.log("Repsonse for channel :", record.channelId,  response.data);
        if (!response.data) {
            continue;
        }
        recentSenders.push(response.data);
        console.log("Recent senders 1", recentSenders);
        
        console.log("Recent senders", recentSenders);
      }
      res.status(200).json({ 'senders': recentSenders });
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      res.status(500).json({ error: 'Failed to fetch recent messages' });
    }
}   
// Get projects
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        user: true,  
      },
    });
    console.log("teamMembers-------", teamMembers);
    const teamMembersWithUsername = teamMembers.map(member => ({
      id: member.id,
      teamId: member.teamId,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      username: member.user.name,
    }));

    console.log("team member List======>>", teamMembersWithUsername);
    recordMetric('teamMember.fetched');
    res.status(200).json({ data: teamMembersWithUsername });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch team member' } });
  }
};

// Create a project
/*const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { role, userId, teamId } = teamMemberSchema.parse(req.body);

        console.log('Received Data:', { role, userId, teamId });

        const result = await teamMember({
            teamId,
            userId,
            role
        });
        console.log("Result in save team---", result);
        recordMetric('teamMember.created');

        res.status(200).json({ data: result });
    } catch (error) {
        console.log("Errore in save team member", error);

        res.status(500).json({ error: { message: 'Failed to save team Member' } });
    }
};  */
/*
// Delete a project
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  console.log("id in delete fun.===", req.query);

  if (!id) {
    res.status(400).json({ error: { message: 'Invalid ID' } });
    return;
  }

  try {
    await prisma.project.delete({
      where: { id: String(id) }
    });

    recordMetric('project.deleted');
    console.log(`project with ID ${id} deleted successfully======`);

    res.status(200).json({ message: 'project deleted successfully' });
  } catch (error) {
    console.log("Error to delete project:", error);
    res.status(500).json({ error: { message: 'Failed to delete project' } });
  }
};

// Update a project
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
*/
// Get a single project by ID
const getSingleUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await prisma.teamMember.findUnique({
      where: { id: String(id) },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
