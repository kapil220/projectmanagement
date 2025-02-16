/* eslint no-use-before-define: 0 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Task } from '../../types';
import { useTranslation } from 'next-i18next';

interface TaskCardProps {
  task: Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  updateTask,
  deleteTask,
  duplicateTask,
}) => {
  const { t } = useTranslation('common');
  const [taskName, setTaskName] = useState(task.name);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const handleBlur = () => {
    updateTask({ ...task, name: taskName, dueDate });
  };

  return (
    <div className="border-t-2 border-black p-4 rounded mb-4 shadow-xl">
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onBlur={handleBlur}
        className="border-none bg-transparent w-full mb-2 font-medium"
        placeholder={t('Task Name')}
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-col">
          <input
            type="date"
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDate(new Date(e.target.value))}
            onBlur={handleBlur}
            className="border-none bg-transparent mb-2"
          />
        </div>
        <div className="flex space-x-2">
          <button onClick={() => duplicateTask(task)}>{t('Duplicate')}</button>
          <button onClick={() => deleteTask(task.id)}>{t('Delete')}</button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
