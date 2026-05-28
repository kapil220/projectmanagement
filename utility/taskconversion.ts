// src/utility/taskConversion.ts

import { TaskType as IndexTaskType } from '../types/index';
import { TaskType as ComponentTaskType } from '../components/tasks/types';

export const convertTaskToComponentType = (
  task: IndexTaskType
): ComponentTaskType => {
  return {
    ...task,
    priority: task.priority as 'Low' | 'Medium' | 'High',
  };
};
