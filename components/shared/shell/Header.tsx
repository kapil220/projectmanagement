/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Brand from './Brand';
import { useViewMode } from '../../../context/viewmodecontext';
import { slug } from '@/lib/zod/primitives';

const initialNotifications = [
  {
    id: 1,
    userImage: '/man.png', // Replace with actual image paths
    userName: 'Abhay Patel',
    action: 'changed the due date from',
    oldDate: 'Aug 2',
    newDate: 'Aug 3',
    time: 'Today, 10:11 am',
    read: false, // Added read status
  },
  {
    id: 2,
    userImage: '/man.png', // Replace with actual image paths
    userName: 'Abhay Patel',
    action: 'changed the due date from',
    oldDate: 'Aug 2',
    newDate: 'Aug 3',
    time: 'Today, 10:11 am',
    read: false, // Added read status
  },
];

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string>('');
  const [viewDropdownOpen, setViewDropdownOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState(initialNotifications); // State for notifications

  const { viewMode, setViewMode } = useViewMode();
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const notificationPopupRef = useRef<HTMLDivElement>(null); // Add ref for notification popup
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (router.pathname.includes('products')) {
      setSelectedLink('Task');
    } else if (router.pathname.includes('chats')) {
      setSelectedLink('Chat');
    } else if (
      router.pathname.includes('files') ||
      router.pathname.includes('projects')
    ) {
      setSelectedLink('Files');
    } else {
      setSelectedLink('');
    }
  }, [router.pathname]);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (
      activeDropdown === 'project' &&
      projectDropdownRef.current &&
      !projectDropdownRef.current.contains(event.target)
    ) {
      setActiveDropdown(null);
    }

    if (
      activeDropdown === 'user' &&
      userDropdownRef.current &&
      !userDropdownRef.current.contains(event.target)
    ) {
      setActiveDropdown(null);
    }

    if (
      viewDropdownOpen &&
      viewDropdownRef.current &&
      !viewDropdownRef.current.contains(event.target)
    ) {
      setViewDropdownOpen(false);
    }

    // Close the notification popup if clicking outside of it
    if (
      isOpen &&
      notificationPopupRef.current &&
      !notificationPopupRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, viewDropdownOpen, isOpen]); // Added `isOpen` to dependencies

  const handleViewChange = (view: 'List' | 'Board') => {
    setViewMode(view);
    setViewDropdownOpen(false);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
  };

  const allRead = notifications.every((notification) => notification.read);

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div className={`bg-backgroundcolor top-0`}>
      <div className="flex justify-between items-center px-10 py-4">
        <div className="flex items-center space-x-8">
          <Brand />
          <div
            className="flex items-center space-x-2 relative p-2"
            ref={projectDropdownRef}
          >
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => toggleDropdown('project')}
            >
              <Image src="/moon.png" alt="moon" width={31} height={31} />
              <span className="text-2xl font-semibold text-left font-roboto">
                {slug}
              </span>
              <div className="pl-40 items-end">
                <ChevronDownIcon className="h-5 w-5 text-black text-bold" />
              </div>
            </div>

            {/* Project Dropdown */}
            {activeDropdown === 'project' && (
              <div className="absolute top-full px-1 mt-2 bg-chatbg border rounded-lg shadow-lg py-1 w-72 z-10">
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  {t('Customize modules')}
                </button>
                <hr className="my-1 border-gray-300" />
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <PaintBrushIcon className="h-5 w-5 mr-2" />
                  {t('Set color and Icon')}
                </button>
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  {t('List setting')}
                </button>
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <UserIcon className="h-5 w-5 mr-2" />
                  {t('People and permissions')}
                </button>
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  {t('Add task via email')}
                </button>
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                  {t('Duplicate')}
                </button>
                <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                  {t('Archive list')}
                </button>
                <hr className="my-1 border-gray-300" />
                <button className="text-left px-4 py-2 text-sm text-red-600 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
                  <TrashIcon className="h-5 w-5 mr-2" />
                  {t('Delete list')}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-14">
            <Link href="/teams/slug/products">
              <span
                className={`relative cursor-pointer text-lg font-semibold ${
                  selectedLink === 'Task' ? 'text-orange-600' : 'text-black'
                }`}
              >
                {t('Task')}
              </span>
            </Link>

            <Link href="/teams/slug/files">
              <span
                className={`relative cursor-pointer text-lg font-semibold ${
                  selectedLink === 'Files' ? 'text-orange-600' : 'text-black'
                }`}
              >
                {t('Files')}
              </span>
            </Link>

            <Link href="/teams/slug/chats">
              <span
                className={`relative cursor-pointer text-lg font-semibold ${
                  selectedLink === 'Chat' ? 'text-orange-600' : 'text-black'
                }`}
              >
                {t('Chat')}
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {(selectedLink === 'Task' || selectedLink === 'Files') && (
            <div className="relative" ref={viewDropdownRef}>
              <button
                onClick={() => setViewDropdownOpen((prev) => !prev)}
                className="text-black flex items-center"
              >
                <Image
                  src="/view.png"
                  alt="View Icon"
                  width={24}
                  height={24}
                  className="h-[21px] w-[21px] mx-2"
                />
                <span className="font-medium text-custom-16 font-inter ">
                  View
                </span>
              </button>
              {viewDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-chatbg border w-[199px] h-[90px] rounded-3xl shadow-lg p-5 z-20 flex space-x-2">
                  <button
                    onClick={() => handleViewChange('List')}
                    className={`flex items-center space-x-2 p-2 w-18 h-10 rounded-lg ${viewMode === 'List' ? 'bg-orange-100 border border-orange-500 text-orange-600' : ' text-black border border-view bg-white'}`}
                  >
                    <Image
                      src="/list.png"
                      alt="List Icon"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                    />
                    <span className="font-inter text-sm font-medium">List</span>
                  </button>
                  <button
                    onClick={() => handleViewChange('Board')}
                    className={`flex items-center space-x-2 p-2 h-10 w-18  rounded-lg ${viewMode === 'Board' ? 'bg-orange-100 border border-orange-500 text-orange-600' : 'border  border-view bg-white text-black'}`}
                  >
                    <Image
                      src="/view.png"
                      alt="Board Icon"
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px]"
                    />
                    <span className="font-inter text-sm font-medium">
                      Board
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="text-black">
            <Image
              src="/message.png"
              alt="Chat Icon"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
          <button className="text-black" onClick={togglePopup}>
            <Image
              src="/bell.png"
              alt="Bell Icon"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
          {isOpen && (
            <div
              className="absolute right-12 top-20 w-[470px] bg-white border border-gray-200 rounded-3xl shadow-lg p-6 z-50"
              ref={notificationPopupRef} // Add ref to the notification popup
            >
              <div className="flex justify-between items-center p-4  border-gray-200">
                <h4 className="text-xl font-poppins font-bold ">
                  Notifications
                </h4>
                <div className="flex items-center">
                  <span
                    className="text-xs font-medium font-poppins text-customorange cursor-pointer flex items-center"
                    onClick={markAllAsRead}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mark all as read
                  </span>

                  <button className="ml-4 font-bold" onClick={togglePopup}>
                    <Image
                      src="/x.png"
                      alt="Close"
                      width={32}
                      height={32}
                      className="h-6 w-6 "
                    />
                  </button>
                </div>
              </div>
              <div className="px-4">
                {allRead ? (
                  <div className="flex flex-col items-center ">
                    <div className="mb-4">
                      <Image
                        src="/party.png"
                        alt="Close"
                        width={32}
                        height={32}
                        className="h-[100px] w-[94px] "
                      />
                    </div>
                    <p className="text-base font-medium font-inter">
                      You’re All Caught Up
                    </p>
                    <p className="text-head text-custom-10">
                      Keep up the great work!
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-6 pr-12">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`flex space-x-4 ${
                          notification.read ? 'text-gray-400' : 'text-black'
                        }`}
                      >
                        <Image
                          src={notification.userImage}
                          alt="User"
                          width={32}
                          height={32}
                          className="rounded-full h-9 w-9"
                        />
                        <div className="text-sm">
                          <p className="text-xs font-poppins">
                            <span className="font-semibold">
                              {notification.userName}
                            </span>{' '}
                            {notification.action}{' '}
                            <span className="font-semibold">
                              {notification.oldDate}
                            </span>{' '}
                            to{' '}
                            <span className="font-semibold">
                              {notification.newDate}
                            </span>
                          </p>
                          <p className="py-2 font-poppins text-xs">
                            {notification.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="flex items-center space-x-2"
              onClick={() => toggleDropdown('user')}
            >
              <Image
                src={session?.user?.image || '/man.png'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex flex-col items-start">
                <span className="font-inter text-custom-16 font-custom-400 leading-custom-19.36 text-left text-black">
                  {session?.user?.name || 'User'}
                </span>
                <span className="font-inter text-custom-8 font-custom-400 leading-custom-9.68 text-left text-black">
                  {session?.user?.email || 'email@example.com'}
                </span>
              </div>
              <ChevronDownIcon className="h-6 w-6 text-black" />
            </button>
            {activeDropdown === 'user' && (
              <div className="absolute right-0 w-48 bg-chatbg border rounded-lg shadow-lg mt-2 py-1 z-10">
                <Link href="/help-center">
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {t('Help Center')}
                  </span>
                </Link>
                <Link href="/contact-us">
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {t('Contact Us')}
                  </span>
                </Link>
                <hr className="my-1 border-gray-300" />
                <Link href={`/teams/${slug}/usersettingpage`}>
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {t('My Settings')}
                  </span>
                </Link>
                <Link href="/notifications">
                  <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    {t('Notifications')}
                  </span>
                </Link>
                <hr className="my-1 border-gray-300" />
                <span
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={handleSignOut}
                >
                  {t('Log Out')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
