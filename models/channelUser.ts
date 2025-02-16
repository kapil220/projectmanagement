import { prisma } from '@/lib/prisma';

// Function to create a new channel-user mapping
export const createChannelUser = async (param: {
    userId?: string;
    channelId: string;
    teamId?: string;
}) => {
    const { userId, channelId, teamId } = param;

    try {
        const channelUser = await prisma.channelUsers.create({
            data: {
                userId: userId ?? '',
                channelId,
                teamId: teamId ?? '',
            },
        });

        return channelUser;
    } catch (error) {
        console.error('Error creating channel-user mapping:', error);
        throw new Error('Failed to create channel-user mapping');
    }
};
