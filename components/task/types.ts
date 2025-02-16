// section.ts

export type TaskType = {
  id: string;
  name: string;
  stage: string;
  dueDate: Date;
  priority: string;
  teamId: string;
  projectId: string;
  assignor: string;
  status: boolean;
  assignee: string;
  description: string;
  tag: string;
};

export type Section = {
  id: number;
  title: string;
  tasks: TaskType[];
};
