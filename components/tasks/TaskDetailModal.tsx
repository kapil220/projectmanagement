/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiActivity } from 'react-icons/fi';
import { FaPlay } from 'react-icons/fa';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { TaskType } from './types';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface TaskDetailModalProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  updateTask: (updatedTask: TaskType) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  updateTask,
}) => {
  const [taskData, setTaskData] = useState<TaskType | null>(task);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedTime, setRecordedTime] = useState<string>('00:00');

  const router = useRouter();
  const { slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';
  const { data: session } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const fetchAttachments = async () => {
    if (!teamId || !taskData?.projectId) return;
    try {
      const response = await axios.get(`/api/files?teamId=${teamId}&projectId=${taskData.projectId}`);
      if (response.data && response.data.data) {
        setAttachments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching task attachments:', error);
    }
  };

  useEffect(() => {
    if (isOpen && taskData?.projectId) {
      fetchAttachments();
    }
  }, [isOpen, taskData?.projectId]);

  const handleTaskFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0 || !teamId || !taskData?.projectId || !session?.user) return;

    setUploadingAttachment(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        try {
          const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          const response = await axios.post('/api/files', {
            name: file.name,
            size: file.size,
            type: file.type,
            url: base64Url,
            teamId,
            projectId: taskData.projectId,
            uploadedBy: session.user.name || session.user.email || 'User',
          });

          if (response.status === 200 && response.data.data) {
            setAttachments((prev) => [response.data.data, ...prev]);
          }
        } catch (err) {
          console.error('Failed to save task attachment:', err);
        }
      }
    } catch (error) {
      console.error('Error uploading task attachment:', error);
    } finally {
      setUploadingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const response = await axios.delete(`/api/files?id=${id}`);
      if (response.status === 200) {
        setAttachments((prev) => prev.filter((file) => file.id !== id));
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  useEffect(() => {
    setTaskData(task);
    setEditedDescription(task?.description || '');
  }, [task]);

  if (!isOpen || !taskData) return null;

  const handleSendComment = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendComment();
    }
  };

  const handleRecordVoice = () => {
    setActiveModal('voice');
  };

  const handleEmojiClick = (emojiObject: any) => {
    setComment(comment + emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleEditDescription = () => {
    if (isEditingDescription) {
      const updatedTask = { ...taskData, description: editedDescription };
      setTaskData(updatedTask);
      updateTask(updatedTask);
    }
    setIsEditingDescription(!isEditingDescription);
  };

  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    setActiveModal(null);
  };

  // Helper to safely format dates for display
  const getFormattedDate = (dateVal: any) => {
    if (!dateVal) return 'No Due Date';
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return 'No Due Date';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    });
  };

  // Helper to safely format date value for HTML5 date inputs
  const getInputDateValue = (dateVal: any) => {
    if (!dateVal) return '';
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl px-8 py-6 rounded-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
        {/* Top Section with Project Name, Stage/Section selector, and Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <span className="w-3 h-3 bg-customorange rounded-full animate-pulse"></span>
            <h1 className="text-sm font-semibold font-inter text-gray-700">Moon</h1>
            <span className="text-gray-300">|</span>
            <select
              value={taskData.stage || 'Planning'}
              onChange={(e) => {
                const updated = { ...taskData, stage: e.target.value };
                setTaskData(updated);
                updateTask(updated);
              }}
              className="text-sm font-semibold font-inter text-customorange bg-transparent border-none focus:outline-none focus:ring-0 p-0 pr-6 cursor-pointer hover:text-black transition-colors"
            >
              {/* Kanban stages */}
              <option value="Planning">Planning</option>
              <option value="To do / Re do">To do / Re do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review/Done">Review/Done</option>
              {/* Product/Today stages */}
              <option value="Overdue">Overdue</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="No Due Date">No Due Date</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" title="Mark Complete">
              <AiOutlineCheckCircle
                size={22}
                className="text-gray-500 hover:text-green-600 transition-colors"
              />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" title="View Activity">
              <FiActivity
                size={22}
                className="text-gray-500 hover:text-black transition-colors"
              />
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all text-gray-500" 
              title="Close modal"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>
        </div>

        <hr className="border-t border-gray-100 my-4" />

        {/* Task Title / Name Input */}
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={!taskData.status}
            onChange={(e) => {
              const updated = { ...taskData, status: !e.target.checked };
              setTaskData(updated);
              updateTask(updated);
            }}
            className="h-6 w-6 mt-1.5 rounded-md border-gray-300 text-customorange focus:ring-customorange cursor-pointer"
          />
          <div className="ml-4 flex-grow">
            <input
              type="text"
              value={taskData.name}
              onChange={(e) => {
                const updated = { ...taskData, name: e.target.value };
                setTaskData(updated);
                updateTask(updated);
              }}
              className="w-full text-2xl font-bold font-inter text-black border-none focus:outline-none focus:ring-0 p-1 bg-transparent hover:bg-gray-100 focus:bg-gray-50 rounded-xl transition-all"
              placeholder="Task Name"
            />
            <p className="text-xs text-gray-400 font-inter font-semibold mt-1 px-1">
              Created by Hammad Khan • 8 minutes ago
            </p>
          </div>
        </div>

        {/* Task Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2 space-y-4">
            
            {/* Due Date Picker */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center w-36">
                <Image
                  src="/calendar.png"
                  alt="Calendar Icon"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-4 font-semibold text-sm font-inter text-gray-500">
                  Due Date:
                </span>
              </div>
              <input
                type="date"
                value={getInputDateValue(taskData.dueDate)}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  const updated = {
                    ...taskData,
                    dueDate: selectedVal ? new Date(selectedVal) : null,
                  };
                  setTaskData(updated);
                  updateTask(updated);
                }}
                className="border border-gray-200 hover:border-gray-400 rounded-full px-4 py-1.5 font-inter text-sm font-medium text-customorange focus:outline-none focus:border-customorange bg-white cursor-pointer transition-colors shadow-sm"
              />
            </div>

            {/* Assignee Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center w-36">
                <Image
                  src="/assignee.png"
                  alt="Assignee Icon"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-4 font-semibold text-sm font-inter text-gray-500">
                  Assignee:
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                  <img
                    src={taskData.assigneeAvatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                    alt="assignee avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={taskData.assignee || ''}
                  onChange={(e) => {
                    const updated = { ...taskData, assignee: e.target.value };
                    setTaskData(updated);
                    updateTask(updated);
                  }}
                  className="border border-gray-200 hover:border-gray-400 focus:border-customorange rounded-full px-4 py-1.5 font-inter text-sm text-black focus:outline-none bg-white w-56 transition-colors shadow-sm"
                  placeholder="Enter assignee name..."
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center w-36">
                <Image
                  src="/priority.png"
                  alt="Priority Icon"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-4 font-semibold text-sm font-inter text-gray-500">
                  Priority:
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={taskData.priority || 'Low'}
                  onChange={(e) => {
                    const updated = {
                      ...taskData,
                      priority: e.target.value as 'Low' | 'Medium' | 'High',
                    };
                    setTaskData(updated);
                    updateTask(updated);
                  }}
                  className={`border border-gray-200 hover:border-gray-400 focus:border-customorange rounded-full px-4 py-1.5 font-inter text-sm font-semibold focus:outline-none bg-white cursor-pointer transition-colors shadow-sm ${
                    taskData.priority === 'High'
                      ? 'text-red-500 bg-red-50 border-red-200'
                      : taskData.priority === 'Medium'
                        ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        : 'text-green-600 bg-green-50 border-green-200'
                  }`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Tag Editor */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center w-36">
                <Image
                  src="/tag.png"
                  alt="Tag Icon"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-4 font-semibold text-sm font-inter text-gray-500">
                  Tag:
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {taskData.tag && (
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                    {taskData.tag}
                  </span>
                )}
                <input
                  type="text"
                  value={taskData.tag || ''}
                  onChange={(e) => {
                    const updated = { ...taskData, tag: e.target.value };
                    setTaskData(updated);
                    updateTask(updated);
                  }}
                  className="border border-gray-200 hover:border-gray-400 focus:border-customorange rounded-full px-4 py-1.5 font-inter text-sm text-black focus:outline-none bg-white w-40 transition-colors shadow-sm"
                  placeholder="Set tag..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic add field options */}
        <button className="text-customorange text-sm font-semibold font-inter mt-4 flex items-center hover:text-black transition-colors">
          <span className="text-lg mr-1">+</span> Add field
        </button>

        {/* Description Section */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-md font-inter text-gray-800">
              Description
            </span>
            <button
              onClick={handleEditDescription}
              className="text-customorange text-sm font-semibold hover:text-black transition-colors flex items-center space-x-1"
            >
              <Image
                src="/pencil.png"
                alt="Pencil Icon"
                width={16}
                height={16}
                className="h-[16px] w-[16px]"
              />
              <span>
                {isEditingDescription ? 'Save' : 'Edit'}
              </span>
            </button>
          </div>

          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full font-inter text-sm p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-customorange focus:ring-1 focus:ring-customorange shadow-inner bg-gray-50 min-h-[140px] transition-all"
              placeholder="Type a descriptive summary of this task..."
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm min-h-[80px]">
              <p className="font-inter text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {taskData.description || 'No description provided. Click Edit to add one.'}
              </p>
            </div>
          )}
        </div>

        {/* Attachments Section */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <span className="font-semibold text-md font-inter text-gray-800 block mb-3">
            Project Attachments ({attachments.length})
          </span>
          {attachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-2xl group shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center min-w-0 flex-grow pr-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-customorange flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </div>
                    <div className="ml-3 truncate">
                      <p className="text-xs font-semibold text-gray-900 truncate font-inter" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {file.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1 text-gray-400 hover:text-customorange rounded transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleAttachmentDelete(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-inter italic">{uploadingAttachment ? 'Uploading...' : 'No attachments uploaded yet. Click the clip icon below to attach files!'}</p>
          )}
        </div>

        {/* Subtask addition option */}
        <button className="mt-4 text-customorange text-sm font-semibold font-inter hover:text-black transition-colors flex items-center space-x-1">
          <Image
            src="/plus2.png"
            alt="Plus Icon"
            width={16}
            height={16}
            className="h-[16px] w-[16px]"
          />
          <span>Add subtask</span>
        </button>

        {/* Comments section */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex space-x-2 items-center mb-4">
            <Image
              src="/comment.png"
              alt="Comment Icon"
              width={16}
              height={16}
              className="h-[16px] w-[16px]"
            />
            <span className="font-semibold text-sm font-inter text-gray-500">
              {comments.length} comments
            </span>
          </div>

          <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2">
            {comments.map((comment, index) => (
              <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-xs font-inter">
                      Hammad Khan
                    </span>
                    <span className="text-gray-400 font-inter text-xs">
                      11:40 pm
                    </span>
                  </div>
                  <p className="text-gray-600 font-inter text-sm mt-1">
                    {comment}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-gray-400 font-inter italic">No comments yet. Write one below!</p>
            )}
          </div>
        </div>

        {/* Voice recording options */}
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={handleRecordVoice}
            className="bg-black hover:bg-gray-800 text-white py-1.5 px-4 rounded-full flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Image
              src="/voicewhite.png"
              alt="Voice Icon"
              width={16}
              height={16}
              className="text-white"
            />
            <span className="font-inter text-xs font-semibold">
              Record Voice
            </span>
          </button>
        </div>

        {/* Comment input bar */}
        <div className="mt-6 flex items-center border-t border-gray-100 pt-4 relative">
          <div className="flex-grow flex items-center border border-gray-200 hover:border-gray-400 focus-within:border-customorange rounded-full px-4 py-1.5 bg-white transition-colors shadow-sm">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow p-2 border-none focus:outline-none rounded-full text-sm font-inter text-black"
            />
            
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors relative"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              <Image
                src="/Emoji.png"
                alt="Emoji Selector"
                width={18}
                height={18}
              />
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-white p-4 rounded-3xl shadow-2xl w-[320px] h-[340px] flex flex-col z-50">
                  <div className="flex-grow overflow-y-scroll">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                </div>
              )}
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-1"
              type="button"
            >
              <Image
                src="/clips.png"
                alt="Attach File"
                width={18}
                height={18}
              />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleTaskFileUpload}
              multiple
              className="hidden"
            />
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-1"
              onClick={handleRecordVoice}
            >
              <Image
                src="/microphone.png"
                alt="Record audio"
                width={18}
                height={18}
              />
            </button>
          </div>
          <button 
            onClick={handleSendComment}
            className="ml-3 bg-customorange hover:bg-black text-white px-5 py-2 rounded-full font-inter text-sm font-semibold transition-all shadow-md"
          >
            Comment
          </button>
        </div>

        {/* Voice Recording Modal */}
        {activeModal === 'voice' && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-96 text-center border border-gray-100">
              <div>
                <h2 className="text-gray-500 text-sm font-semibold font-inter">Voice Recorder</h2>
                <p className="text-3xl font-bold mt-2 font-inter text-black">{recordedTime}</p>
              </div>

              <div className="flex justify-center items-center p-6">
                {recording ? (
                  <button
                    onClick={stopRecording}
                    type="button"
                    className="flex items-center bg-red-100 hover:bg-red-200 text-red-600 px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2 animate-pulse"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    type="button"
                    className="flex items-center bg-green-100 hover:bg-green-200 text-green-600 px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4V20M4 12h16" />
                    </svg>
                    Start Recording
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="border border-gray-300 hover:bg-gray-50 bg-white rounded-full font-semibold text-gray-700 w-32 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-black hover:bg-gray-800 text-white rounded-full font-semibold w-32 py-2 text-sm transition-colors shadow-sm"
                >
                  Send File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
