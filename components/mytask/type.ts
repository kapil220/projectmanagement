// components/mytask/type.ts
export interface TaskType {
  id: string;
  name: string;
  description: string;
  dueDate: Date | null;
  priority: 'Low' | 'Medium' | 'High';
  assignor: string;
  assignee: string;
  assigneeAvatar?: string;
  status: boolean;
  tag: string;
  teamId: string;
  projectId: string;
  stage: string;
}

export type Section = {
  id: number;
  title: string;
  tasks: TaskType[];
};
