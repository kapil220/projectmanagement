/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineCheckCircle } from 'react-icons/ai';
import { FiActivity } from 'react-icons/fi';
import { FaPlay } from 'react-icons/fa';
import Image from 'next/image';
import EmojiPicker from 'emoji-picker-react';
import { TaskType } from '../../types';

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
    // Implement actual recording logic here (e.g., using MediaRecorder API)
  };

  const stopRecording = () => {
    setRecording(false);
    setActiveModal(null);
    // Implement stop recording logic here and save the audio file
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl px-8 py-4 rounded-lg shadow-lg relative">
        {/* Top Section with Project Name, Section Name, and Icons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <h1 className="custom-18 font-md font-inter">Moon</h1>
            <span className="text-black">|</span>
            <h2 className="custom-18 font-md font-inter">In Progress</h2>
          </div>

          <div className="flex items-center space-x-4">
            <button>
              <AiOutlineCheckCircle
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </button>
            <button>
              <FiActivity
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </button>
            <button onClick={onClose}>
              <AiOutlineClose
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </button>
          </div>
        </div>

        <hr className="border-t border-black my-1 mb-4" />

        <div className="flex items-start">
          <input
            type="checkbox"
            className="h-5 w-5 mt-1 rounded border-black text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-4">
            <h2 className="custom-18 font-md font-inter">{taskData.name}</h2>
            <p className="text-xs text-kk font-inter font-semibold">
              Created by Hammad Khan • 8 minutes ago
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6 mt-4">
          <div className="flex-grow">
            <div className="space-y-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex">
                  <div>
                    <Image
                      src="/calendar.png"
                      alt="Button Image"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                    />
                  </div>
                  <span className="w-24 ml-4 font-medium text-base font-inter text-head">
                    Due Date:
                  </span>
                </div>

                <p className="text-customorange">
                  {taskData.dueDate?.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex">
                  <Image
                    src="/assignee.png"
                    alt="Button Image"
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                  <span className="w-24 ml-4 font-medium text-base font-inter text-head">
                    Assignee:
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="assignee avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="assignee avatar"
                    className="w-6 h-6 rounded-full ml-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex">
                  <Image
                    src="/priority.png"
                    alt="Button Image"
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                  <span className="w-24 ml-4 font-medium text-base font-inter text-head">
                    Priority:
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Image
                    src="/high.png"
                    alt="Button Image"
                    width={18}
                    height={18}
                    className="h-[16px] w-[16px]"
                  />
                  <p className="text-red-500">{taskData.priority}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex">
                  <Image
                    src="/tag.png"
                    alt="Button Image"
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                  <span className="w-24 ml-4 font-medium text-base font-inter text-head">
                    Tags:
                  </span>
                </div>

                <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {taskData.tag || 'No Tag'}
                </span>
              </div>
            </div>

            <button className="text-customorange text-base font-medium font-inter mb-4">
              + Add field
            </button>

            <div className="mb-4 flex-row items-center space-y-2">
              <button
                onClick={handleRecordVoice}
                className="bg-black text-white py-2 px-4 rounded-xl flex items-center space-x-2"
              >
                <Image
                  src="/voicewhite.png"
                  alt="Button Image"
                  width={18}
                  height={18}
                  className="text-white"
                />{' '}
                <span className="font-inter text-xs font-medium">
                  Record Voice
                </span>
              </button>

              <div className="flex space-x-2">
                <button className="bg-voicebg text-customorange text-xs font-inter font-medium px-4 py-2 rounded-md flex items-center space-x-2">
                  <FaPlay className="w-3 h-3" />
                  <span>Voice file 1.mp3</span>
                </button>
                <button className="bg-voicebg text-customorange text-xs font-inter font-medium px-4 py-2 rounded-md flex items-center space-x-2">
                  <FaPlay className="w-3 h-3" />
                  <span>Voice file 2.mp3</span>
                </button>
                <button className="bg-voicebg text-customorange text-xs font-inter font-medium px-4 py-2 rounded-md flex items-center space-x-2">
                  <FaPlay className="w-3 h-3" />
                  <span>Voice file 3.mp3</span>
                </button>
              </div>
            </div>

            <div className="mb-2">
              <span className="font-medium text-base font-inter">
                Description:
              </span>
              {isEditingDescription ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full font-inter text-base mt-2 rounded-lg focus:outline-none"
                />
              ) : (
                <p className="mt-2 font-inter text-sm ">
                  {taskData.description}
                </p>
              )}
            </div>
            <div className="grid justify-start gap-2 mb-2">
              <button
                onClick={handleEditDescription}
                className="text-customorange text-xs font-inter"
              >
                <div className="flex space-x-1">
                  <Image
                    src="/pencil.png"
                    alt="Button Image"
                    width={16}
                    height={16}
                    className=" h-[16px] w-[16px] "
                  />
                  <span>
                    {isEditingDescription
                      ? 'Save description'
                      : 'Edit description'}
                  </span>
                </div>
              </button>
              <button className="text-customorange text-xs  font-inter">
                <div className="flex space-x-1">
                  {' '}
                  <Image
                    src="/plus2.png"
                    alt="Button Image"
                    width={18}
                    height={18}
                    className=" h-[16px] w-[16px]"
                  />
                  <span> Add subtask</span>
                </div>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex space-x-2 items-center mb-4">
                <Image
                  src="/comment.png"
                  alt="Button Image"
                  width={18}
                  height={18}
                  className=" h-[16px] w-[16px]"
                />
                <span className="font-inter text-xs">
                  {comments.length} comments
                </span>
              </div>
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="comment avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-inter text-black text-xs">
                          Hammad Khan
                        </span>
                        <span className="text-head font-inter text-xs">
                          11:40 pm
                        </span>
                      </div>
                      <p className="text-black font-inter text-custom-10">
                        {comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center border-t pt-4 relative">
          <div className="flex-grow flex items-center border border-black rounded-full px-4 py-2 hover:border-customorange">
            <input
              type="text"
              placeholder="Write a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow p-2 border-none focus:outline-none rounded-full"
            />
            <button
              className="text-black relative"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              <Image
                src="/Emoji.png"
                alt="Button Image"
                width={18}
                height={18}
                className="mr-4"
              />
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-white p-4 rounded-3xl shadow-lg w-[300px] h-[300px] flex flex-col z-50">
                  <div className="flex-grow overflow-y-scroll">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                </div>
              )}
            </button>
            <button className="text-black">
              <Image
                src="/clips.png"
                alt="Button Image"
                width={18}
                height={18}
                className="mr-4"
              />
            </button>
            <button className="text-black" onClick={handleRecordVoice}>
              <Image
                src="/microphone.png"
                alt="Button Image"
                width={18}
                height={18}
                className="mr-4"
              />
            </button>
          </div>
        </div>

        {/* Voice Recording Modal */}
        {activeModal === 'voice' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96 h-48">
              <div className="text-center">
                <h2 className="text-chat text-sm">Recording</h2>
                <p className="text-xl text-bold">{recordedTime}</p>
              </div>

              <div className="flex justify-center items-center p-4 ">
                {recording ? (
                  <button
                    onClick={stopRecording}
                    type="button"
                    className="flex items-center text-xl text-red-500 font-semibold mx-2"
                  >
                    <svg
                      className="w-12 h-5 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    type="button"
                    className="flex items-center mr-8 text-teal-500 text-xl font-semibold mx-2"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4V20M4 12h16" />
                    </svg>
                    Start
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn border bg-white rounded-full text-borderdelete border-borderdelete hover:border-black hover:bg-gray-200 w-36"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn bg-black text-white rounded-full hover:bg-gray-800 w-36"
                >
                  Send
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
