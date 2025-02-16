/* eslint-disable i18next/no-literal-string */
import React, { useState, useRef, useEffect } from 'react';
import { TaskType } from '../../types';
import { HiDotsVertical } from 'react-icons/hi';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { BsChatDots } from 'react-icons/bs';
import { Draggable } from 'react-beautiful-dnd';

interface TaskCardProps {
  task: TaskType;
  index: number;
  onCardClick: (task: TaskType) => void;
  updateTask: (updatedTask: TaskType) => void;
  deleteTask: (taskId: string) => void;
  duplicateTask: (task: TaskType) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onCardClick,
  updateTask,
  deleteTask,
  duplicateTask,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState(task.name);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [dueDate, setDueDate] = useState(
    task.dueDate?.toISOString().substring(0, 10) || ''
  );

  // Create refs for the modals and dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameModalRef = useRef<HTMLDivElement>(null);
  const assignModalRef = useRef<HTMLDivElement>(null);
  const dueDateModalRef = useRef<HTMLDivElement>(null);
  const duplicateModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRename = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowRenameModal(true);
    setIsDropdownOpen(false);
  };

  const handleAssign = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowAssignModal(true);
    setIsDropdownOpen(false);
  };

  const handleDueDate = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDueDateModal(true);
    setIsDropdownOpen(false);
  };

  const handleDuplicate = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDuplicateModal(true);
    setIsDropdownOpen(false);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDeleteModal(true);
    setIsDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !renameModalRef.current?.contains(event.target as Node) &&
      !assignModalRef.current?.contains(event.target as Node) &&
      !dueDateModalRef.current?.contains(event.target as Node) &&
      !duplicateModalRef.current?.contains(event.target as Node) &&
      !deleteModalRef.current?.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
      setShowRenameModal(false);
      setShowAssignModal(false);
      setShowDueDateModal(false);
      setShowDuplicateModal(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRenameConfirm = () => {
    if (newSectionName) {
      updateTask({ ...task, name: newSectionName });
      setShowRenameModal(false);
    }
  };

  const handleAssignConfirm = () => {
    if (assignee) {
      updateTask({ ...task, assignee });
      setShowAssignModal(false);
    }
  };

  const handleDueDateConfirm = () => {
    const dueDateObj = new Date(dueDate);
    if (!isNaN(dueDateObj.getTime())) {
      updateTask({ ...task, dueDate: dueDateObj });
      setShowDueDateModal(false);
    } else {
      alert('Invalid date format');
    }
  };

  const handleDuplicateConfirm = () => {
    duplicateTask(task);
    setShowDuplicateModal(false);
  };

  const handleDeleteConfirm = () => {
    deleteTask(task.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            className="bg-dropdown p-4 rounded-lg w-72 h-[124px] shadow-md relative border-t-4 border-blue-300"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onCardClick(task)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <h3 className="custom-16 text-black">{task.name}</h3>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button className="text-black" onClick={toggleDropdown}>
                  <HiDotsVertical className="w-[18px] h-[18px]" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 p-2 w-48 bg-white rounded-xl shadow-lg z-10">
                    <ul className="py-1">
                      <li
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleRename}
                      >
                        <img
                          src="/rename.png"
                          alt="Close"
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] mr-2"
                        />{' '}
                        <span className="text-custom-18">Rename</span>
                      </li>
                      <li
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleAssign}
                      >
                        <img
                          src="/ass.png"
                          alt="Close"
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] filter mr-2"
                        />{' '}
                        <span className="text-custom-18">Assignee</span>
                      </li>
                      <li
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleDueDate}
                      >
                        <img
                          src="/calendar.png"
                          alt="Close"
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] mr-2"
                        />{' '}
                        <span className="text-custom-18"> Due Date</span>
                      </li>
                      <li
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleDuplicate}
                      >
                        <img
                          src="/duplicate.png"
                          alt="Close"
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] mr-2"
                        />{' '}
                        <span className="text-custom-18"> Duplicate</span>
                      </li>
                      <li
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleDelete}
                      >
                        <img
                          src="/trash.png"
                          alt="Close"
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] mr-2"
                        />{' '}
                        <span className="text-custom-18">Delete</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center my-3">
              <span className="bg-orange-200 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                {task.tag || 'No Tag'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-orange-600">
                  {task.dueDate
                    ? task.dueDate.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'No Due Date'}
                </span>
                <AiOutlinePaperClip className="w-4 h-4 text-gray-500" />
                <BsChatDots className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src="https://randomuser.me/api/portraits/women/50.jpg"
                  alt="assignee avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={renameModalRef}
            className="bg-white rounded-lg p-6 w-[600px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                Edit Task Name
              </h3>
              <button
                onClick={() => setShowRenameModal(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-borderdelete my-2 mb-4">Task Name</label>
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
                onClick={handleRenameConfirm}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={assignModalRef}
            className="bg-white rounded-lg p-6 w-[600px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                Assign Task
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-borderdelete my-2 mb-4">
                Assignee Name
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                placeholder="Type a name..."
                autoFocus
              />
            </div>

            <div className="modal-action flex justify-end mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignConfirm}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due Date Modal */}
      {showDueDateModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={dueDateModalRef}
            className="bg-white rounded-lg p-6 w-[600px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                Set Due Date
              </h3>
              <button
                onClick={() => setShowDueDateModal(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="flex flex-col mt-4">
              <label className="text-borderdelete my-2 mb-4">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                placeholder="Select a date..."
                autoFocus
              />
            </div>

            <div className="modal-action flex justify-end mt-6">
              <button
                onClick={() => setShowDueDateModal(false)}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={handleDueDateConfirm}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={duplicateModalRef}
            className="bg-white rounded-lg p-6 w-[600px] h-[250px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                Confirm Duplicate
              </h3>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to duplicate the task{' '}
              <strong>{task.name}</strong>?
            </p>
            <div className="modal-action flex justify-end mt-12">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-borderdelete hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateConfirm}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-lg p-6 w-[600px] h-[250px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                Confirm Delete
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the task{' '}
              <strong>{task.name}</strong>? This action cannot be undone.
            </p>
            <div className="modal-action flex justify-end mt-12">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-borderdelete hover:bg-gray-200 w-36"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn bg-delete text-white rounded-full px-6 py-2 ml-2 hover:bg-red-700 w-36"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
