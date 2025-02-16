import { prisma } from '@/lib/prisma';

export const group = async (param: {
    user_id?: string;
    groupName: string;
    status?: boolean;
    teamId?: string;
}) => {
    const { user_id, groupName, status, teamId } = param;

    const group = await prisma.chatGroup.create({
        data: {
            user_id,
            groupName,
            status,
            teamId
        },
    });

    return group;
};
export const getAuthUrl = async () => {
    return await prisma.chatGroup.findMany();
};
export const updateGroupStatus = async (id: string) => {
    return await prisma.chatGroup.update({
        where: { id },
        data: { status: false },
    });
};