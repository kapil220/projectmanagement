/* eslint-disable i18next/no-literal-string */
import React, { useState, useRef, useEffect } from 'react';
import type { Section, TaskType } from '../../types'; // Import as type-only
import TaskCard from './taskcard';
import { HiPlus, HiDotsVertical } from 'react-icons/hi';
import { Droppable } from 'react-beautiful-dnd';
import Image from 'next/image';

interface SectionProps {
  section: Section;
  addTask: () => void;
  updateTask: (updatedTask: TaskType) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (task: TaskType) => void;
  color: string;
  onCardClick: (task: TaskType) => void;
  renameSection: (sectionId: number, newTitle: string) => void;
  deleteSection: (sectionId: number) => void;
}

const Section: React.FC<SectionProps> = ({
  section,
  addTask,
  updateTask,
  deleteTask,
  duplicateTask,
  color,
  onCardClick,
  renameSection,
  deleteSection,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState(section.title);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        renameModalRef.current &&
        !renameModalRef.current.contains(event.target as Node)
      ) {
        setShowRenameModal(false);
      }
      if (
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRename = () => {
    if (newSectionName.trim() !== '') {
      renameSection(section.id, newSectionName);
    }
    setShowRenameModal(false);
  };

  const handleDelete = () => {
    deleteSection(section.id);
    setShowDeleteModal(false);
  };

  const handleCloseDialog = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="w-72 flex-shrink-0 overflow-y-auto h-screen">
      <div
        className={`p-3 h-11 rounded-lg border ${color} flex items-center justify-between mb-4 shadow-sm`}
      >
        <h2 className="text-md font-md custom-18 text-black">
          {section.title}
        </h2>
        <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
          <button
            className="text-black font-bold"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <HiDotsVertical className="w-5 h-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute p-2 right-0 top-8 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setShowRenameModal(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-custom-18 text-black hover:bg-gray-100 w-full text-left"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-custom-18 text-black hover:bg-gray-100 w-full text-left"
              >
                Delete
              </button>
            </div>
          )}
          <button className="text-black" onClick={addTask}>
            <HiPlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <Droppable droppableId={section.id.toString()} type="TASK">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list space-y-4"
          >
            {section.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                updateTask={updateTask}
                deleteTask={deleteTask}
                duplicateTask={duplicateTask}
                onCardClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button
        onClick={addTask}
        className="mt-4 text-customorange font-medium p-4 rounded-lg custom-18 whitespace-nowrap flex items-center"
      >
        <HiPlus className="w-6 h-6 mr-1" />
        Add Task
      </button>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={renameModalRef}
            className="bg-white rounded-3xl p-6 w-[600px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-3xl font-semibold leading-custom-21.78 custom-29.7">
                Edit Section
              </h3>
              <button
                onClick={() => {
                  handleCloseDialog();
                }}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <Image
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-borderdelete text-2xl my-2 mb-4">
                Section Name
              </label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                placeholder="Type a name..."
                autoFocus
              />
            </div>

            <div className="modal-action flex justify-end mt-6">
              <button
                onClick={() => setShowRenameModal(false)}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-3xl p-6 w-[600px] h-[273px]"
          >
            <div className="flex justify-between items-center mb-4 my-2">
              <h3 className="font-inter text-3xl font-semibold leading-custom-21.78 custom-29.7">
                Confirm Delete
              </h3>
              <button
                onClick={() => handleCloseDialog()}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <Image
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>
            <p className="text-gray-700 text-custom-18 mb-6">
              Are you sure you want to delete the section{' '}
              <strong>{section.title}</strong>? This action cannot be undone.
            </p>
            <div className="modal-action flex justify-end mt-12">
              <button
                onClick={() => handleCloseDialog()}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-borderdelete hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  handleCloseDialog();
                }}
                className="btn bg-delete text-white rounded-full px-6 py-2 ml-2 hover:bg-red-700 w-36"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;
