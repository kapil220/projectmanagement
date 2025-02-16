import { prisma } from '@/lib/prisma';
export const upsertLastReadTime = async (param: {
    userId: string;
    channelId: string;
    teamId: string;
    lastReadTime: Date;
  }) => {
    const { userId, channelId, teamId, lastReadTime } = param;
    if (!prisma) {
      throw new Error('Prisma client is not initialized');
    }
    return await prisma.lastReadTime.upsert({
      where: {
        // Use a unique combination of fields in the `where` clause
        userId_teamId_channelId: {
          userId,
          teamId,
          channelId,
        },
      },
      update: {
        lastReadTime,
        updatedAt: new Date(),
      },
      create: {
        userId,
        channelId,
        teamId,
        lastReadTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  };
  