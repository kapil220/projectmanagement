/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ChatGroup, Message } from './type';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
const CLOSE_SYMBOL = '✕';

interface User {
  name: string;
  profileImage: string;
  isOnline: boolean;
  lastSeen: string;
}

interface TopBarProps {
  toggleSidebar?: () => void;
  activeUser?: User;
  activeGroup: string;
  setSearchQuery: (query: string) => void;
  onUploadDocument: () => void;
  onAddLink: () => void;
  onNotifications: () => void;
  onVoiceMessage: () => void;
  onUploadPhoto: () => void;
  directMessages: any[];
  /*  groupChats: any[];
    setGroupChats: (groupChats: any[]) => void;
    type: string; */
  user: User;
  message: Message;
  isDirectMessagesOpen: boolean;
  isGroupChatsOpen: boolean;
  isChannelsOpen: boolean;
  activeChannel: any;
  lastSeenTime: any;
  recentUser: any[];
}

const TopBar: React.FC<TopBarProps> = ({
  activeUser,
  activeGroup,
  setSearchQuery,
  onUploadDocument,
  onAddLink,
  onNotifications,
  onVoiceMessage,
  onUploadPhoto,
  directMessages = [],
  //  groupChats,
  //  setGroupChats,
  //  type ,
  user,
  message,
  isDirectMessagesOpen,
  isGroupChatsOpen,
  isChannelsOpen,
  activeChannel,
  lastSeenTime,
 // recentUsers = []
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchQuery, setSearchQueryState] = useState<string>('');

  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState<boolean>(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false);
  const [links, setLinks] = useState<string[]>([
    'www.example.com',
    'www.example.com',
    'www.example.com',
    'www.example.com',
    'www.example.com',
  ]);
  const [images, setImages] = useState<string[]>([
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
    '/6.png',
    '/7.png',
    '/8.png',
    '/9.png',
    '/10.png',
    '/11.png',
    '/12.png',
  ]);
  const [notifications, setNotifications] = useState<string[]>([
    t('Notification 1'),
    t('Notification 2'),
    t('Notification 3'),
    t('Notification 4'),
  ]);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: 'file1.pdf', size: '1.2MB' },
    { name: 'file2.docx', size: '0.8MB' },
    { name: 'file3.xlsx', size: '2.3MB' },
    { name: 'file4.pptx', size: '4.5MB' },
  ]);

  const [voiceMessages, setVoiceMessages] = useState<string[]>([
    t('Voice Message 1'),
    t('Voice Message 2'),
    t('Voice Message 3'),
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => !searchQuery && setIsSearchFocused(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQueryState(query);
    setSearchQuery(query);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openLinkModal = () => {
    setIsLinkModalOpen(true);
    setShowDropdown(false);
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
  };

  const openImagesModal = () => {
    setIsImagesModalOpen(true);
    setShowDropdown(false);
  };

  const closeImagesModal = () => {
    setIsImagesModalOpen(false);
  };

  const openNotificationsModal = () => {
    setIsNotificationsModalOpen(true);
    setShowDropdown(false);
  };

  const closeNotificationsModal = () => {
    setIsNotificationsModalOpen(false);
  };

  const openFilesModal = () => {
    setIsFilesModalOpen(true);
    setShowDropdown(false);
  };

  const closeFilesModal = () => {
    setIsFilesModalOpen(false);
  };

  const openVoiceModal = () => {
    setIsVoiceModalOpen(true);
    setShowDropdown(false);
  };

  const closeVoiceModal = () => {
    setIsVoiceModalOpen(false);
  };

  const removeLink = (index: number) => {
    setLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const removeNotification = (index: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeVoiceMessage = (index: number) => {
    setVoiceMessages((prevVoiceMessages) =>
      prevVoiceMessages.filter((_, i) => i !== index)
    );
  };
  const lastSeenTimeFormatted = new Date(lastSeenTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // for 12-hour format with AM/PM, remove this for 24-hour format
  });
  console.log('Direct Messages:', directMessages);

  const addMember = async() => {
    try {
      const response = await axios.post('/api/channel-user',  );
      console.log("Response data:", response);
    } catch (error) {
      console.error('Error saving last seen time', error);
    }
    }
  return (
    <div className="bg-white p-4 flex justify-between rounded-3xl items-center">
      <div className="flex items-center">

        <div className="flex items-center">
          { activeChannel.type === 'Direct Message' ? (
            <Image
              src={activeChannel.profileImage || '/man.png'}
              alt={`${activeChannel.name} profile`}
              width={40}
              height={40}
              className="rounded-full mr-2"
            />) : null}
          <div>
            <span className="text-black text-[20px] font-medium font-inter">
              {activeChannel.name}
            </span>
            {activeChannel.type === 'Direct Message' ? (
              <span className="text-sm text-gray-400 block">
                {activeChannel.isOnline
                  ? t('Online')
                  : `${t('Last seen')} : ${lastSeenTimeFormatted}`}
              </span>
            ) : null}
          </div>
        </div>

      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-full">
          <div className="w-56 flex items-center rounded-full border border-black text-chat focus:ring-1 focus:ring-customorange hover:border-customorange">
            {!isSearchFocused && (
              <Image
                src="/search.png"
                alt="Search Icon"
                width={48}
                height={48}
                className="text-chat filter hover:text-customorange brightness-75 grayscale h-6 w-6 m-2"
              />
            )}
            <input
              type="text"
              placeholder={isSearchFocused ? '' : t('Search here')}
              className="flex-grow rounded-full py-2 focus:pl-8 border-none text-chat placeholder-chat placeholder:font-light focus:outline-none"
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onChange={handleSearchChange}
              value={searchQuery}
            />
          </div>
        </div>
        {!activeUser && !(activeChannel.type === 'Direct Message') && (
          <div
            onClick={() => setIsUserPopupOpen(true)}
            className="flex pr-2">
            <Image
              src="/active.png"
              alt="Notifications"
              width={24}
              height={24}
              className="mx-1 h-6 w-6 text-active"
            //  onClick={addMember}
            />
            <h2 className="text-active"> {activeChannel?.userCount || '0'}</h2>
          </div>
        )}
        <button onClick={handleDropdownClick} className="relative p-2 pl-4">
          <div className="text-3xl">{'⋮'}</div>
        </button>
      </div>
      {isUserPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[350px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-inter text-black text-xl font-semibold">
                Members
              </h3>
              <button
                onClick={() => setIsUserPopupOpen(false)}
                className="bg-transparent hover:bg-transparent border-none p-0"
              >
                <Image
                  src="/x.png"
                  alt="Close"
                  width={24}
                  height={24}
                  className="h-6 w-6 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="flex flex-col space-y-4">
            {Array.isArray(directMessages) && directMessages
            .filter(user => user.userId !== session?.user.id)
            .map((user) => (

                <div
                  key={user.name}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
                  onClick={() => {
                    // Handle click event, e.g., set active channel or something else
                    setIsUserPopupOpen(false);
                  }}
                >
                  <img
                    src={(user.profileImage) || '/man.png'}
                    alt={user.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="font-inter text-black text-lg">
                    {user.username}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  addMember();
                  //  setIsUserPopupOpen(false);
                  //  setIsAddMemberModalOpen(true);
                }}
                className="flex items-center justify-center bg-black text-white text-base font-medium rounded-full px-4 py-2 hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddMemberModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[350px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Member</h2>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-gray-600 hover:text-black"
                aria-label="Close"
              >
                <Image
                  src="/x.png"
                  alt="Close"
                  width={24}
                  height={24}
                  className="h-6 w-6 text-active"
                />
              </button>
            </div>
            <form>
              <input
                type="text"
                placeholder="Enter member name"
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  type="button"
                  className="bg-gray-200 text-black px-4 py-2 rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-20 top-44 mt-2 w-56 h-60 bg-chatbg p-2 border border-gray-200 rounded-2xl shadow-2xl z-50"
        >
          <ul className="p-4">
            <li
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={openNotificationsModal}
            >
              <Image
                src="/group10.png"
                alt={t('Notifications')}
                width={16}
                height={16}
                className="mr-4 mx-2 "
              />
              <span className="text-sm font-medium leading-6">
                {t('Notifications')}
              </span>
            </li>
            <li
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={openLinkModal}
            >
              <Image
                src="/link.png"
                alt={t('Links')}
                width={16}
                height={16}
                className="mr-4 mx-2 "
              />
              <span className="text-sm font-medium leading-6">
                {' '}
                {t('Links')}
              </span>
            </li>
            <li
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={openFilesModal}
            >
              <Image
                src="/file.png"
                alt={t('Files')}
                width={16}
                height={16}
                className="mr-4 mx-2 "
              />
              <span className="text-sm font-medium leading-6">
                {t('Files')}
              </span>
            </li>
            <li
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={openImagesModal}
            >
              <Image
                src="/group5.png"
                alt={t('Images')}
                width={16}
                height={16}
                className="mr-4 mx-2 "
              />
              <span className="text-sm font-medium leading-6">
                {t('Images')}
              </span>
            </li>
            <li
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={openVoiceModal}
            >
              <Image
                src="/voice.png"
                alt={t('Voice')}
                width={16}
                height={16}
                className="mr-4 mx-2 "
              />
              <span className="text-sm font-medium leading-6">
                {' '}
                {t('Voice')}
              </span>
            </li>
          </ul>
        </div>
      )}

      {isLinkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[550px] p-6">
            <div className="flex justify-between items-center m-4 mb-6">
              <h2 className="text-xl font-bold">{t('Links')}</h2>
              <button
                onClick={closeLinkModal}
                className="text:xl text-black"
                aria-label={t('Close')}
              >
                <Image
                  src="/x.png"
                  alt="Notifications"
                  width={24}
                  height={24}
                  className="mx-1 h-6 w-6 text-active"
                />
              </button>
            </div>
            <ul className="space-y-4">
              {links.map((link, index) => (
                <li
                  key={index}
                  className="flex items-center p-6 px-4 justify-between  hover:bg-ggbg border border-gg h-[56px] rounded-2xl shadow-sm"
                >
                  <span className="text-base text-gray-800">{link}</span>
                  <button
                    onClick={() => removeLink(index)}
                    className="text-gray-5"
                    aria-label={t('Remove')}
                  >
                    <Image
                      src="/action.png"
                      alt="Notifications"
                      width={24}
                      height={24}
                      className="mx-1 h-6 w-6 text-active"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isImagesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-[500px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('Images')}</h2>
              <button
                onClick={closeImagesModal}
                className="text-gray-600 hover:text-black"
                aria-label={t('Close')}
              >
                <Image
                  src="/x.png"
                  alt={t('Close')}
                  width={24}
                  height={24}
                  className="mx-1 h-6 w-6 text-active"
                />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4  ">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={t(`Image ${index + 1}`)}
                    width={140}
                    height={140}
                    className="h-36 rounded-lg w-36 "
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isNotificationsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{t('Notifications')}</h2>
              <button
                onClick={closeNotificationsModal}
                className="text-gray-600 hover:text-black"
                aria-label={t('Close')}
              >
                {CLOSE_SYMBOL}
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
                >
                  <span>{notification}</span>
                  <button
                    onClick={() => removeNotification(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={t('Remove')}
                  >
                    {CLOSE_SYMBOL}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isFilesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[550px] p-6">
            <div className="flex justify-between items-center m-4 mb-6">
              <h2 className="text-xl font-bold">{t('Files')}</h2>
              <button
                onClick={closeFilesModal}
                className="text:xl text-black"
                aria-label={t('Close')}
              >
                <Image
                  src="/x.png"
                  alt={t('Close')}
                  width={24}
                  height={24}
                  className="mx-1 h-6 w-6 text-active"
                />
              </button>
            </div>
            <ul className="space-y-4">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center p-6 px-4 justify-between hover:bg-ggbg border border-gg h-[68px] rounded-2xl shadow-sm"
                >
                  <div className="flex gap-2">
                    <Image
                      src="/zip.png"
                      alt={t('Remove')}
                      width={36}
                      height={36}
                      className="mx-1 h-9 w-9 "
                    />
                    <div className="grid gap-0">
                      <span className="text-sm text-semibold text-black">
                        {file.name}
                      </span>
                      <span className="text-gray-500 text-sm">{file.size}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-5"
                    aria-label={t('Remove')}
                  >
                    <Image
                      src="/action.png"
                      alt={t('Remove')}
                      width={24}
                      height={24}
                      className="mx-1 h-6 w-6 text-active"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isVoiceModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[550px] p-4">
            <div className="flex justify-between items-center m-4 mb-6">
              <h2 className="text-xl font-bold">{t('Voice Record')}</h2>
              <button
                onClick={closeVoiceModal}
                className="text:xl text-black"
                aria-label={t('Close')}
              >
                <Image
                  src="/x.png"
                  alt={t('Close')}
                  width={24}
                  height={24}
                  className="mx-1 h-6 w-6 text-active"
                />
              </button>
            </div>
            <ul className="space-y-4">
              {voiceMessages.map((voice, index) => (
                <li
                  key={index}
                  className="flex items-center p-6 px-4 justify-between hover:bg-ggbg border border-gg h-[56px] rounded-2xl shadow-sm"
                >
                  <div className="flex gap-2 items-center">
                    {' '}
                    <Image
                      src="/play.png"
                      alt={t('Remove')}
                      width={18}
                      height={18}
                      className="mx-1 h-5 w-5 item-center"
                    />{' '}
                    <span className="text-base text-gray-800">{voice}</span>
                  </div>

                  <button
                    onClick={() => removeVoiceMessage(index)}
                    className="text-gray-5"
                    aria-label={t('Remove')}
                  >
                    <Image
                      src="/action.png"
                      alt={t('Remove')}
                      width={24}
                      height={24}
                      className="mx-1 h-6 w-6 text-active"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
