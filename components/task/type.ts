/*export interface Task {
  id: string;
  name: string;
  dueDate: string;
}
*/
export interface TaskType {
  id: string;
  name: string;
  dueDate: Date | null; // Adjusted here

 // dueDate?: Date;
  assignee?: string;
  teamId?: string;
  projectId?: string;
  stage: string;
  assignor?: string;
  description?: string;
  tag?: string;
  status?: boolean;
  priority?: string;
}
export interface Section {
  id: number;
  title: string;
  tasks: TaskType[];
}
