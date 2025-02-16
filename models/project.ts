import { prisma } from '@/lib/prisma';

export const project = async (param: {
  user_id?: string;
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  teamId?:   string;
/*  details?: string;
  employees?: string[]; */
}) => {
  const { user_id, projectName, description, startDate, endDate, teamId} = param;

  const project = await prisma.project.create({
    data: {
      user_id,
      projectName,
      description,
      startDate,
      endDate,
      teamId
    },
  });

  return project;
};

export const getProjects = async (userId: string) => {
  return await prisma.project.findMany({
    where: {
      user_id: userId,
    },
  });
};
export const updateGroupStatus = async (id: string) => {
  return await prisma.chatGroup.update({
      where: { id },
      data: { status: false },
  });
};