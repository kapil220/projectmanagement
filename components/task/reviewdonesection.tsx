import React from 'react';
import { Section, TaskType } from '../../types';
import TaskCard from './taskcard';
import { useTranslation } from 'next-i18next';

interface ReviewDoneSectionProps {
  section: Section;
  tasks: TaskType[];
  addTask: (sectionId: number) => void;
  /*  updateTask: (updatedTask: Task, sectionId: number) => void;
  deleteTask: (taskId: string, sectionId: number) => void;
  duplicateTask: (task: Task, sectionId: number) => void;     */
}

const ReviewDoneSection: React.FC<ReviewDoneSectionProps> = ({
  section,
  addTask,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="w-1/4 mb-5">
      <div className="p-4 rounded-lg border-2 border-green-500 flex items-center justify-between mb-4 shadow-xl">
        <h2 className="text-lg font-semibold text-black">
          {section.title} {section.tasks.length}
        </h2>
        <div className="flex items-center space-x-2">
          <button className="text-black">•••</button>
          <button
            onClick={() => addTask(section.id)}
            className="text-black flex items-center"
          >
            <span className="text-xl">+</span>
          </button>
        </div>
      </div>
      {section.tasks.map((task) => (
        <TaskCard
          key={task.id}
          // task={task}
          task={{
            ...task,
            dueDate: task.dueDate ?? null,
            assignee: task.assignee ?? null,
            teamId: task.teamId ?? null,
            projectId: task.projectId ?? null,
            stage: task.stage ?? null,
            assignor: task.assignor ?? null,
            description: task.description ?? null,
            tag: task.tag ?? null,
            status: task.status ?? null,
            priority: task.priority ?? null,
          }}
          updateTask={function (): void {
            throw new Error('Function not implemented.');
          }}
          deleteTask={function (): void {
            throw new Error('Function not implemented.');
          }}
          duplicateTask={function (): void {
            throw new Error('Function not implemented.');
          }} /* 
          updateTask={(updatedTask) => updateTask(updatedTask, section.id)}
          deleteTask={(taskId) => deleteTask(taskId, section.id)}
          duplicateTask={(taskToDuplicate) =>
            duplicateTask(taskToDuplicate, section.id)
          } 
          */
        />
      ))}
      <button
        onClick={() => addTask(section.id)}
        className="mt-4 text-green-500 flex items-center"
      >
        <span className="mr-1">+</span> {t('Create Task')}
      </button>
    </div>
  );
};

export default ReviewDoneSection;
