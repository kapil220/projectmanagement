/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Message } from './type';
import { STRINGS } from './constants';
import Image from 'next/image';
import EmojiPickerModal from './emojipickermodal'; // Import the new component
import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  handleSendMessage: (content: {
    type: 'text' | 'image' | 'audio';
    content: string;
    repliedTo?: string;
  }) => void;
  replyTo: Message | null;
  setReplyTo: React.Dispatch<React.SetStateAction<Message | null>>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  handleSendMessage,
  replyTo,
  setReplyTo,
}) => {
  const [message, setMessage] = useState<string>('');
  const [activeModal, setActiveModal] = useState<
    'emoji' | 'voice' | 'attach' | null
  >(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]); // Updated state to handle multiple files
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const handleClickOutside = (event: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target as Node) &&
      activeModal
    ) {
      setActiveModal(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModal]);

  const toggleModal = (modalType: 'emoji' | 'voice' | 'attach') => {
    setActiveModal((prev) => (prev === modalType ? null : modalType));
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev: string) => prev + (emojiObject.emoji || ''));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (err) {
      console.error('Error accessing microphone', err);
      // Handle the error properly
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordingTime(0);
    stopTimer();
  };

  const handleSendRecording = () => {
    if (audioURL) {
      handleSendMessage({ type: 'audio', content: audioURL });
      setAudioURL(null);
      resetRecording();
      setActiveModal(null);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }
  };

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true, // Allow multiple files
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (message.trim()) {
      handleSendMessage({ type: 'text', content: message });
      setMessage('');
      setReplyTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSendFile = () => {
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const binaryStr = reader.result as string;
          handleSendMessage({ type: 'image', content: binaryStr });
        };
        reader.readAsDataURL(file);
      });
      setFiles([]); // Clear files after sending
      setActiveModal(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="relative" ref={modalRef}>
        <EmojiPickerModal
          isOpen={activeModal === 'emoji'}
          onClose={() => setActiveModal(null)}
          onEmojiClick={handleEmojiClick}
        />
      </div>
      <div
        {...getRootProps()}
        className={`p-4 ${isDragActive ? 'bg-borderdelete' : 'bg-white'} rounded-3xl`}
      >
        <input {...getInputProps()} />
        <form onSubmit={handleSubmit} className="p-4">
          {replyTo && (
            <div className="bg-gray-100 p-2 mb-2 rounded">
              <strong>{STRINGS.replyTo(replyTo.user)}</strong>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-red-500 ml-2"
              >
                {STRINGS.cancel}
              </button>
            </div>
          )}
          <div className="flex items-center rounded-full bg-white p-4 border border-black hover:border-customorange">
            <div className="flex-grow px-4">
              <textarea
                className={`text-lg text-black resize-none focus:outline-none border-none w-full inter font-dark ${
                  isFocused ? 'placeholder-transparent' : 'placeholder-chat'
                }`}
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
            </div>

            <div className="flex justify-end gap-6 w-52 px-2">
              <button type="button" onClick={() => toggleModal('emoji')}>
                <Image
                  src={'/Emoji.svg'}
                  alt="Emoji"
                  width={24}
                  height={24}
                  className="rounded"
                  style={{
                    filter:
                      activeModal === 'emoji'
                        ? 'brightness(0) invert(0)'
                        : 'none',
                  }}
                />
              </button>

              <button
                className="hover:text-customorange"
                type="button"
                onClick={() => toggleModal('attach')}
              >
                <Image
                  src={'/clip.svg'}
                  alt="Attach"
                  width={24}
                  height={24}
                  className="rounded"
                  style={{
                    filter:
                      activeModal === 'attach'
                        ? 'brightness(0) invert(0)'
                        : 'none',
                  }}
                />
              </button>

              <button
                className="hover:text-customorange"
                type="button"
                onClick={() => toggleModal('voice')}
              >
                <Image
                  src={'/voice2.svg'}
                  alt="Voice"
                  width={24}
                  height={24}
                  className="rounded"
                  style={{
                    filter:
                      activeModal === 'voice'
                        ? 'brightness(0) invert(0)'
                        : 'none',
                  }}
                />
              </button>

              <button
                className="text-gray-500 hover:text-customorange"
                type="submit"
              >
                <Image
                  src={'/send.svg'}
                  alt="Send"
                  width={24}
                  height={24}
                  className="rounded"
                />
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* Voice and Attach Modals */}
      {activeModal === 'voice' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white p-4 rounded-lg shadow-lg w-96 h-48 "
            ref={modalRef}
          >
            <div className="text-center">
              <h2 className="text-chat text-sm">{t('Recording')}</h2>
              <p className="text-xl text-bold">{formatTime(recordingTime)}</p>
            </div>

            <div className="flex justify-center items-center p-4 ">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
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
                  {t('Start')}
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="flex items-center text-teal-500 font-semibold mx-2"
                    >
                      <svg
                        className="w-5 h-5 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 19H6V5h4v14zm8-14h-4v14h4V5z" />
                      </svg>
                      {t('Pause')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (mediaRecorderRef.current) {
                          mediaRecorderRef.current.resume();
                          setIsPaused(false);
                          startTimer();
                        }
                      }}
                      className="flex items-center text-xl  text-teal-500 font-semibold mx-2"
                    >
                      <svg
                        className="w-5 h-5 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {t('Resume')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopRecording}
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
                    {t('Stop')}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn border bg-white rounded-full text-borderdelete border-borderdelete hover:border-black hover:bg-gray-200 w-36"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSendRecording}
                className="btn bg-black text-white rounded-full hover:bg-gray-800 w-36"
              >
                {t('Send')}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'attach' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white rounded-3xl shadow-lg w-[550px] p-1"
            ref={modalRef}
          >
            <div className="flex justify-between items-center px-6 pt-6 pb-2">
              <div>
                <h1 className="text-lg text-black font-semibold">
                  {t('File Upload')}
                </h1>
                <h2 className="text-sm pr-8 text-borderdelete font-normal">
                  {
                    'Add your documents here, and you can upload up to 5 files max'
                  }
                </h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-borderdelete"
              >
                <Image src="/x.png" alt="Button Image" width={24} height={24} />
              </button>
            </div>
            <div className="px-6 ">
              <div
                {...getRootProps({
                  className:
                    'border-2 border-black rounded-lg py-6 px-6 text-center border-dashed',
                })}
              >
                <input {...getInputProps({ multiple: true })} />
                <Image
                  src="/drag.png"
                  alt="Button Image"
                  width={42}
                  height={42}
                  className="mx-auto mb-4"
                />
                <p className="text-black text-sm font-inter">
                  {'Drag your files to upload'}
                </p>
                <p className="text-gray-500 my-2">{t('or')}</p>
                <button
                  type="button"
                  onClick={open}
                  className="text-black font-semibold text-sm border border-black px-3 py-2 rounded-lg"
                >
                  {'Browse files'}
                </button>
              </div>
              <p className="text-sm text-borderdelete font-normal mt-1">
                {'Only support .jpg, .png, .svg, and .zip files'}
              </p>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.slice(0, 5).map((file, index) => (
                    <div
                      key={index}
                      className="border-gray-200 border rounded-lg py-4 px-4 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <Image
                          src="/zip.png"
                          alt="File Icon"
                          width={36}
                          height={36}
                          className="mx-2"
                        />
                        <div>
                          <p className="text-bold text-sm custom-18.15 text-black">
                            {file.name}
                          </p>
                          <p className="text-sm text-filesize custom-16.2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Image
                          src="/action.png"
                          alt="Delete Icon"
                          width={24}
                          height={24}
                          className="mx-2"
                        />
                      </button>
                    </div>
                  ))}
                  {files.length > 5 && (
                    <p className="text-red-500">
                      {'You can only upload up to 5 files.'}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end p-6">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="btn border bg-white rounded-full text-borderdelete border-borderdelete hover:border-black hover:bg-gray-200 w-36"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSendFile}
                className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
              >
                {t('Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
