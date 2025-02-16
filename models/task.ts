import { prisma } from '@/lib/prisma';

export const task = async (param: {
    name: string;
    projectId?: string | null;
    description?: string;
    dueDate?: Date;
    assignee?: string;
    assignor?: string;
    priority?: string
    stage: string;
    teamId?: string;
    status?: boolean;
    tag?: string;
}) => {
    const {
        stage,
        name,
        projectId=  null,
        description = "default_description",
        dueDate = new Date(),
        priority = "default_priority",
        assignor = "default_assignor",
        assignee = "default_assignee",
        teamId,
        status,
        tag = "default_tag",
    } = param;

    const task = await prisma.task.create({
        data: {
            projectId,
            stage,
            name,
            description,
            dueDate,
            assignor,
            priority,
            assignee,
            status,
            tag,
            teamId
        },
    });

    return task;
};

export const gettask = async (teamId: string) => {
    return await prisma.task.findMany({
        where: {
            teamId: teamId,
        },
    });
};
