export * from './base';
export * from './next';
// src/types/index.ts
/*export interface Task {
  id: string;
  name: string;
  dueDate: string;
}
*/
// types/index.ts

export type TaskType = {
  id: string;
  name: string;
  stage: string;
  dueDate: Date | null;
  priority: string;
  teamId: string;
  projectId: string;
  assignor: string;
  status: boolean;
  assignee: string;
  description: string;
  tag: string;
  assigneeAvatar?: string;
};

export type Section = {
  id: number;
  title: string;
  tasks: TaskType[];
};
