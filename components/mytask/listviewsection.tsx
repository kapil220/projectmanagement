/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import Image from 'next/image';
import { Section as SectionType, TaskType } from './type'; // Ensure consistent import path

interface ListViewSectionProps {
  section: SectionType;
  updateTask: (task: TaskType) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (task: TaskType) => void;
  onCardClick: (task: TaskType) => void;
  addTask: (task: TaskType) => void;
  color: string; // Add the color prop
}

const ListViewSection: React.FC<ListViewSectionProps> = ({
  section,
  updateTask,
  deleteTask,
  duplicateTask,
  onCardClick,
  addTask,
  color, // Destructure the color prop
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskType>({
    id: '',
    name: '',
    description: '',
    dueDate: new Date(), // Ensure this is a Date object
    priority: 'Low',
    assignor: '',
    assignee: '',
    assigneeAvatar: '', // Ensure this is part of TaskType
    status: false,
    tag: '',
    teamId: '',
    projectId: '',
    stage: '',
  });

  const handleAddTask = () => {
    setNewTask({
      ...newTask,
      id: Date.now().toString(),
    });
    setShowForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: name === 'dueDate' ? new Date(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTask(newTask);
    setShowForm(false);
  };

  // You can determine background and text color based on the section title or some other property
  const bgColorClass =
    section.title === 'Overdue'
      ? 'bg-red-100 text-red-700'
      : section.title === 'Today'
        ? 'bg-yellow-100 text-yellow-700'
        : section.title === 'Tomorrow'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-700';

  return (
    <div className="mb-6">
      {/* Section Title */}
      <div
        className={`p-4 rounded-t-lg font-semibold ${color} ${bgColorClass}`}
      >
        <h3>
          {section.title} ({section.tasks.length})
        </h3>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-md rounded-lg">
        {/* Header Row */}
        <div className="grid grid-cols-12 p-2 items-center justify-between ">
          <span className="col-span-1 pr-2 border-r border-gray-200">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-gray-600"
            />
          </span>
          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-2">
            <Image
              src="/taskname.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Task Name</span>
          </div>
          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-3">
            <Image
              src="/taskdes.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Description</span>
          </div>

          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-2">
            <Image
              src="/calendar.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Due Date</span>
          </div>
          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-2">
            <Image
              src="/tag.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Tags</span>
          </div>
          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-1">
            <Image
              src="/Assignee.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Assignee</span>
          </div>
          <div className="flex gap-1 pr-2 border-r border-gray-200 col-span-1">
            <Image
              src="/Priority.png"
              alt="Button Image"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
            <span className="text-xs font-inter text-head2">Priority</span>
          </div>
        </div>

        {/* Tasks Rows */}
        {section.tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onCardClick(task)}
            className="grid grid-cols-12 items-center p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
          >
            {/* Checkbox */}
            <div className="col-span-1 pr-2 border-r border-gray-200">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-gray-600"
              />
            </div>
            {/* Task Name */}
            <div className="col-span-2 flex items-center space-x-2 pr-2 border-r border-gray-200">
              <span className="font-medium truncate">{task.name}</span>
            </div>
            {/* Description */}
            <div className="col-span-3 text-sm text-gray-700 truncate pr-2 border-r border-gray-200">
              {task.description}
            </div>
            {/* Due Date */}
            <div className="col-span-2 text-sm pr-2 border-r border-gray-200">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : 'No Due Date'}
            </div>
            {/* Tags */}
            <div className="col-span-2 pr-2 border-r border-gray-200">
              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                {task.tag}
              </span>
            </div>
            {/* Assignee */}
            <div className="col-span-1 flex space-x-1 pr-2 border-r border-gray-200">
              {task.assignee && (
                <Image
                  src={task.assigneeAvatar || '/default-avatar.png'}
                  alt="Assignee"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
            {/* Priority */}
            <div className="col-span-1 pr-2 border-r border-gray-200">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}

        {/* Add Task Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 grid grid-cols-12 gap-4">
            <input
              type="text"
              name="name"
              value={newTask.name}
              onChange={handleInputChange}
              placeholder="Task Name"
              className="col-span-2 px-2 py-1 border rounded"
              required
            />
            <input
              type="text"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="col-span-3 px-2 py-1 border rounded"
            />
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate?.toISOString().split('T')[0]}
              onChange={handleInputChange}
              className="col-span-2 px-2 py-1 border rounded"
              required
            />
            <input
              type="text"
              name="tag"
              value={newTask.tag}
              onChange={handleInputChange}
              placeholder="Tag"
              className="col-span-2 px-2 py-1 border rounded"
            />
            <input
              type="text"
              name="assignee"
              value={newTask.assignee}
              onChange={handleInputChange}
              placeholder="Assignee"
              className="col-span-2 px-2 py-1 border rounded"
            />
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleInputChange}
              className="col-span-1 px-2 py-1 border rounded"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button
              type="submit"
              className="col-span-12 bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Task
            </button>
          </form>
        )}
        {!showForm && (
          <div className="p-4">
            <button
              onClick={handleAddTask}
              className="flex items-center px-4 py-2 border border-black  shadow-lg font-semibold"
            >
              Add Task <span className="ml-2 text-lg">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListViewSection;
