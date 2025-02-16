/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  IconButton,
  MenuItem,
  ListItemText,
  Popper,
  ClickAwayListener,
  Paper,
  Grow,
  MenuList,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Padding } from '@mui/icons-material';
import { Message, ChatGroup, Project, LastReadTime, User } from './type';
import { channel } from 'diagnostics_channel';
import { projectName } from '@/lib/zod/primitives';
import { lastReadTime } from '@/lib/zod';
interface SidebarProps {
  channels: any[];
  // channels: Project[];
  groupChats: ChatGroup[];
  setGroupChats: React.Dispatch<React.SetStateAction<ChatGroup[]>>;
  directMessages: any[];
  isSidebarOpen: boolean;
  // setActiveChannel: (any: {}) => void;
  setActiveChannel: (value: unknown) => void;
  updateChannels: (updatedChannels: string[]) => void;
  updateGroupChats: (updatedGroupChats: ChatGroup[]) => void;
  updateDirectMessages: (updatedDirectMessages: string[]) => void;

  // updateDirectMessages: (updatedDirectMessages: DirectMessage[]) => void;
  onlineUsers: LocalUser[];
  unreadMessages: Message[];
  fetchChatGroup: () => void;
  recentUsers: any[];
}
interface LocalUser {
  id?: string; // Optional if not always provided
  name: string;
  isOnline: boolean;
  profileImage: string;
  lastSeen?: string; // Optional if not always provided
}

const Sidebar: React.FC<SidebarProps> = ({
  channels,
  groupChats,
  setGroupChats,
  directMessages = [],
  isSidebarOpen,
  setActiveChannel,
  updateChannels,
  updateGroupChats,
  updateDirectMessages,
  onlineUsers,
  unreadMessages,
  fetchChatGroup,
  recentUsers,
}) => {
  const {
    data: session,
    //  status
  } = useSession();
  const { query } = useRouter();
  const { slug } = query as { slug: string };
  const [isChannelsOpen, setIsChannelsOpen] = useState<boolean>(true);
  const [isGroupChatsOpen, setIsGroupChatsOpen] = useState<boolean>(true);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] =
    useState<boolean>(true);
  const [newChannel, setNewChannel] = useState<string>('');
  const [newGroupChat, setNewGroupChat] = useState<string>('');
  const [newDirectMessage, setNewDirectMessage] = useState<string>('');
  const [showChannelInput, setShowChannelInput] = useState<boolean>(false);
  const [showGroupChatInput, setShowGroupChatInput] = useState<boolean>(false);

  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [showDirectMessageInput, setShowDirectMessageInput] =
    useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<
    | 'createChannel'
    | 'createGroupChat'
    | 'createDirectMessage'
    | 'delete'
    | 'search'
    | 'addMember' // Add 'addMember' here
    | null
  >(null);
  const [channelSearchQuery, setChannelSearchQuery] = useState<string>('');
  const [groupChatSearchQuery, setGroupChatSearchQuery] = useState<string>('');
  const [directMessageSearchQuery, setDirectMessageSearchQuery] =
    useState<string>('');
  const [currentSearchPlaceholder, setCurrentSearchPlaceholder] =
    useState<string>('Search Channels');
  const [groupToDelete, setGroupToDelete] = useState<ChatGroup | null>(null);
  const [channelDelete, setChannelDelete] = useState<Project | null>(null);
  const [channelsList, setChannelsList] = useState<Project[]>([]);
  const [recentUser, setRecentUser] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [chatGroupData, setChatGroupData] = useState<ChatGroup>({
    id: '',
    user_id: '',
    teamId: slug,
    groupName: '',
    status: true,
  });
  const [channelData, setChannelData] = useState<Project>({
    id: '',
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    teamId: slug,
    user_id: '',
    status: true,
  });
  type Member = LocalUser;

  const toggleChannels = () => setIsChannelsOpen(!isChannelsOpen);
  const toggleGroupChats = () => setIsGroupChatsOpen(!isGroupChatsOpen);
  const toggleDirectMessages = () =>
    setIsDirectMessagesOpen(!isDirectMessagesOpen);
  console.log('Recent users===>>>', recentUsers);
  const handleAddChannel = () => {
    if (newChannel) {
      const updatedChannels = [...channels, newChannel];
      //  updateChannels(updatedChannels);
      setNewChannel('');
      setShowChannelInput(false);
    }
  };
  const handleAddGroupChat = () => {
    if (newGroupChat) {
      const updatedGroupChats = [...groupChats, newGroupChat];
      //     updateGroupChats(updatedGroupChats);
      setNewGroupChat('');
      setShowGroupChatInput(false);
    }
  };
  const handleAddDirectMessage = () => {
    if (newDirectMessage) {
      const updatedDirectMessages = [...directMessages, newDirectMessage];
      updateDirectMessages(updatedDirectMessages);
      setNewDirectMessage('');
      setShowDirectMessageInput(false);
    }
  };
  /* const handleDeleteChannel = (channel: string) => {
     const updatedChannels = channels.filter((ch) => ch !== channel);
     updateChannels(updatedChannels);
   };
 */
  const handleDeleteDirectMessage = (dm: string) => {
    const updatedDirectMessages = directMessages.filter(
      (message) => message !== dm
    );
    updateDirectMessages(updatedDirectMessages);
  };
  const getUnreadCount = (user: string) => {
    return unreadMessages.filter((msg) => msg.user === user).length;
  };
  const isUserOnline = (user: string) => {
    return onlineUsers.some((u) => u.name === user && u.isOnline);
  };
  const getUserProfileImage = (user: string) => {
    const foundUser = onlineUsers.find((u) => u.name === user);
    return foundUser ? foundUser.profileImage : '';
  };
  const handlePlusClick = (
    event: React.MouseEvent<HTMLElement>,
    section: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen((prev) => currentSection !== section || !prev);
    setCurrentSection(section);
  };
  const handleSearchClick = (section: string) => {
    setDialogType('search');
    setDialogOpen(true);
    // Set placeholder text based on the current section
    if (section === 'channels') {
      setCurrentSearchPlaceholder('Search Channels');
    } else if (section === 'groupChats') {
      setCurrentSearchPlaceholder('Search Group Chats');
    } else if (section === 'directMessages') {
      setCurrentSearchPlaceholder('Search Members');
    }
  };
  const handleCloseMenu = (event: Event) => {
    if (anchorEl && anchorEl.contains(event.target as HTMLElement)) {
      return;
    }
    setMenuOpen(false);
    setCurrentSection(null);
  };
  const handleMenuItemClick = (option: string) => {
    setMenuOpen(false);
    if (option === 'create') {
      if (currentSection === 'channels') {
        setDialogType('createChannel');
      } else if (currentSection === 'groupChats') {
        setDialogType('createGroupChat');
      } else if (currentSection === 'directMessages') {
        setDialogType('createDirectMessage');
      }
    } else if (option === 'delete') {
      setDialogType('delete');
    }
    setDialogOpen(true);
  };
  const handleSaveDialog = () => {
    if (currentSection === 'channels') {
      handleAddChannel();
    } else if (currentSection === 'groupChats') {
      handleAddGroupChat();
    }
    handleCloseDialog();
  };
  console.log('channels----', channels);
  const filteredChannels = channels.filter((channel) =>
    // channel.projectName?.toLowerCase().includes(channelSearchQuery.toLowerCase())
    channel.toLowerCase().includes(channelSearchQuery.toLowerCase())
  );
  console.log('filteredChannels----', filteredChannels);
  const filteredGroupChats = groupChats.filter(
    (group) =>
      group.groupName.toLowerCase().includes(groupChatSearchQuery.toLowerCase())
    // group.toLowerCase().includes(groupChatSearchQuery.toLowerCase())
  );
  const filteredDirectMessages = directMessages.filter((dm) =>
    dm.username.toLowerCase().includes(directMessageSearchQuery.toLowerCase())
  );
  const filteredUsers = onlineUsers.filter((user) =>
    user.name.toLowerCase().includes(directMessageSearchQuery.toLowerCase())
  );
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setChatGroupData({
      ...chatGroupData,
      [name]: value,
    });
  };
  const addChatGroups = async () => {
    try {
      const response = await fetch('/api/chatGroups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatGroupData),
      });
      const responseData = await response.json();
      setChatGroupData(responseData.data);
      fetchChatGroup();
    } catch (error) {
      console.error('Error saving chat group', error);
      alert('Failed to Save chat group');
    }
  };
  const handleDeleteGroupChat = (groupName: string) => {
    const group = groupChats.find((g) => g.groupName === groupName);
    if (group) {
      setGroupToDelete(group);
      setDialogType('delete');
      setDialogOpen(true);
    }
  };
  const handleConfirmDelete = async () => {
    if (groupToDelete) {
      console.log('groupToDelete:', groupToDelete);
      try {
        await axios.put(
          `/api/chatGroups?id=${encodeURIComponent(groupToDelete.id)}`,
          { status: false }
        );
        const updatedGroupChats = groupChats.filter(
          (chat) => chat.id !== groupToDelete.id
        );
        setGroupChats(updatedGroupChats);
        handleCloseDialog();
      } catch (error) {
        console.error('Failed to update chat group status:', error);
      }
    }
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setGroupToDelete(null);
  };
  const addChannels = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
      });
      const responseData = await response.json();
      setChannelData(responseData.data);
      fetchChannelList();
    } catch (error) {
      console.error('Error saving chatnnel', error);
      alert('Failed to Save channel');
    }
  };
  const handleDeleteChannel = (id: string) => {
    const group = channelsList.find((g) => g.id === id);
    console.log('id---', id);
    console.log('group---', group);
    if (group) {
      setChannelDelete(group);
      setDialogType('delete');
      console.log('dialoOpen--', dialogOpen);
      setDialogOpen(true);
    }
  };
  const ConfirmDeleteChannel = async () => {
    if (channelDelete) {
      console.log('groupToDelete:', channelDelete);
      try {
        await axios.put(
          `/api/projects?id=${encodeURIComponent(channelDelete.id)}`,
          { status: false }
        );
        const updatedGroupChats = groupChats.filter(
          (chat) => chat.id !== channelDelete.id
        );
        setGroupChats(updatedGroupChats);
        handleCloseDialog();
        fetchChannelList();
      } catch (error) {
        console.error('Failed to delete channel:', error);
      }
    }
  };
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    user: LocalUser
  ) => {
    const fullUser: LocalUser = {
      ...user,
      id: user.id || 'default-id',
      lastSeen: user.lastSeen || new Date().toISOString(),
    };

    if (e.target.checked) {
      setSelectedMembers((prevSelected) => [...prevSelected, fullUser]);
    } else {
      setSelectedMembers((prevSelected) =>
        prevSelected.filter((selectedUser) => selectedUser.name !== user.name)
      );
    }
  };

  const fetchChannelList = async () => {
    try {
      const response = await axios.get('/api/projects');
      const newData = response.data.data;
      console.log('newData from channels list', newData);
      const activeChannels = newData.filter(
        (channel) => channel.status === true
      );
      console.log('activeChannels  list----', activeChannels);
      //  const channelNames = newData.map((project: any) => project.projectName);
      setChannelsList(activeChannels);
    } catch (error) {
      console.error('Error fetching projectlist', error);
    }
  };
  const fetchRecentUser = async () => {
    try {
      const response = await axios.get(
        `/api/team-member?action=lastSeenTime&user_id=${session?.user.id}`
      );
      const newData = response.data;
      console.log('newData from recent user', newData);
      setRecentUser(newData);
    } catch (error) {
      console.error('Error fetching recent user', error);
    }
  };
  useEffect(() => {
    fetchChannelList();
    fetchRecentUser();
  }, []);
  const saveMembers = () => {
    // Add logic for saving members here
    console.log('Saving members...');
  };
  return (
    <div
      className={`h-full ${
        isSidebarOpen ? 'block' : ''
      } w-80 bg-white text-black p-3 absolute rounded-3xl z-0 sidebar-container scrollbar-thin scrollbar-thumb-rounded  scrollbar-thumb-[#1c1917] scrollbar-track-[#e7e7eb]`}
      style={{
        paddingRight: '16px',
        overflowY: 'scroll',
      }}
    >
      <div className="">
        <h2 className="font-inter text-custom-18 font-custom-500 text-customorange leading-custom-21.78 text-left py-4 mx-4">
          Recent Messages
        </h2>
        <ul>
          {/*  {unreadMessages
            //     .filter((msg) => msg.unreadCount > 0)  */}
          {recentUsers.map((unreadmsg) => (
            <li
              key={unreadmsg.id}
              className="mb-2 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group"
            >
              <div
                onClick={() =>
                  setActiveChannel({
                    name: unreadmsg.username,
                    id: [session?.user.id, unreadmsg.userId].sort().join('-'),
                    toUserId: unreadmsg.userId,
                    type: 'Direct Message',
                  })
                }
                className="flex items-center"
              >
                <Image
                  src={getUserProfileImage(unreadmsg.username) || '/man.png'}
                  alt={`${unreadmsg.user} profile`}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
                <span>{unreadmsg.username}</span>
              </div>
              {/*}      <span className="bg-customorange text-white border-4 border-customorange rounded-full flex items-center justify-center w-8 h-8 text-sm font-semibold">
                  {msg.unreadCount}
                </span>  */}
            </li>
          ))}
        </ul>
      </div>
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78 text-left py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isChannelsOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleChannels}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleChannels}
            />
          )}
          Channels
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('channels')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton onClick={(event) => handlePlusClick(event, 'channels')}>
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isChannelsOpen && (
        <div>
          <ul>
            {channelsList.map((channel) => (
              <li
                key={channel.id}
                className="mb-2 mx-4 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
              >
                <span
                  onClick={() =>
                    setActiveChannel({
                      name: channel.projectName,
                      id: channel.id,
                      type: 'channel',
                    })
                  }
                >
                  # {channel.projectName}
                </span>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer hidden group-hover:block mr-2"
                  onClick={() => handleDeleteChannel(channel.id)}
                />
              </li>
            ))}
          </ul>
          {showChannelInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Channel"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddChannel}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78  py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isGroupChatsOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleGroupChats}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleGroupChats}
            />
          )}
          Group Chat
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('groupChats')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton onClick={(event) => handlePlusClick(event, 'groupChats')}>
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isGroupChatsOpen && (
        <div>
          <ul>
            {filteredGroupChats.map((group) => (
              <li
                key={group.id}
                className="mb-2 mx-4 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
              >
                <span
                  onClick={() =>
                    setActiveChannel({
                      name: group.groupName,
                      id: group.id,
                      type: 'Group Chat',
                    })
                  }
                >
                  {group.groupName}
                </span>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer hidden group-hover:block mr-2"
                  onClick={() => handleDeleteGroupChat(group.groupName)}
                />
              </li>
            ))}
          </ul>
          {showGroupChatInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Group Chat"
                value={newGroupChat}
                onChange={(e) => setNewGroupChat(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddGroupChat}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78 text-left py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isDirectMessagesOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleDirectMessages}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleDirectMessages}
            />
          )}
          Direct Messages
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('directMessages')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton
            onClick={(event) => handlePlusClick(event, 'directMessages')}
          >
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isDirectMessagesOpen && (
        <div>
          <ul>
            {Array.isArray(directMessages) &&
              directMessages
                .filter((dm) => dm.userId !== session?.user.id)
                .map((dm) => (
                  <li
                    key={dm.id}
                    className="mb-2 mx-4 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
                  >
                    <div
                      onClick={() =>
                        setActiveChannel({
                          name: dm.username,
                          id: [session?.user.id, dm.userId].sort().join('-'),
                          toUserId: dm.userId,
                          type: 'Direct Message',
                        })
                      }
                      className="flex items-center"
                    >
                      <Image
                        src={getUserProfileImage(dm.user) || '/man.png'}
                        alt={`${dm.user} profile`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="mr-2">{dm.username}</span>
                      {isUserOnline(dm.username) ? (
                        <span className="text-green-500">●</span>
                      ) : (
                        <span className="text-gray-500">●</span>
                      )}
                    </div>
                    <XMarkIcon
                      className="h-5 w-5 cursor-pointer hidden group-hover:block"
                      onClick={() => handleDeleteDirectMessage(dm)}
                    />
                  </li>
                ))}
          </ul>
          {showDirectMessageInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Direct Message"
                value={newDirectMessage}
                onChange={(e) => setNewDirectMessage(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddDirectMessage}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <Popper
        open={menuOpen}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        placement="bottom-start"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper
              style={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
            >
              <ClickAwayListener onClickAway={handleCloseMenu}>
                <MenuList
                  autoFocusItem={menuOpen}
                  id="menu-list-grow"
                  className="rounded-3xl bg-dropdown w-auto m-4 shadow-xl"
                  style={{ padding: '15px' }}
                >
                  <MenuItem
                    onClick={() => handleMenuItemClick('create')}
                    className="hover:bg-transparent hover:text-black focus:bg-transparent "
                  >
                    <Image
                      src="/add.png"
                      alt="Create"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    <ListItemText
                      primary={`Create ${
                        currentSection === 'channels'
                          ? 'Channel'
                          : currentSection === 'groupChats'
                            ? 'Group Chat'
                            : 'Direct Message'
                      }`}
                      className="px-4 font-inter p-2 font-extrabold text-[20px] text-black"
                    />
                  </MenuItem>
                  {currentSection !== 'directMessages' && (
                    <MenuItem
                      onClick={() => handleMenuItemClick('delete')}
                      className="hover:bg-transparent hover:text-black focus:bg-transparent "
                    >
                      <Image
                        src="/delete.png"
                        alt="Delete"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <ListItemText
                        primary={`Delete ${
                          currentSection === 'channels'
                            ? 'Channel'
                            : 'Group Chat'
                        }`}
                        className="px-4 font-inter p-2 font-extrabold text-[20px] text-black"
                      />
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      {dialogOpen && (
        <>
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-30"></div>
          <div
            className={`modal modal-right-side ${dialogOpen ? 'modal-open' : ''} fixed top-0 right-0 z-50`}
          >
            <div
              className={`modal-box rounded-3xl p-6 right-0 z-50 ${
                dialogType === 'search'
                  ? 'w-[450px]'
                  : dialogType === 'createDirectMessage' ||
                      dialogType === 'addMember' // Use the same width for 'addMember'
                    ? 'w-[450px]'
                    : 'w-[600px]'
              }`}
            >
              {dialogType === 'createChannel' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                      Create a channel
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">Name</label>
                    <input
                      type="text"
                      autoFocus
                      value={channelData.projectName}
                      onChange={(e) =>
                        setChannelData((prev) => ({
                          ...prev,
                          projectName: e.target.value,
                        }))
                      }
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        addChannels();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'createGroupChat' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                      Create a Group Chat
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">Name</label>
                    <input
                      type="text"
                      name="groupName"
                      value={chatGroupData.groupName}
                      onChange={handleChange}
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        addChatGroups();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'createDirectMessage' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-black text-xl font-semibold">
                      Members
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
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
                    {filteredUsers.map((user) => (
                      <div
                        key={user.name}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
                      >
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <span className="font-inter text-black grow text-lg">
                          {user.name}
                        </span>
                        <input
                          type="checkbox"
                          className="ml-auto h-5 w-5 justify-end"
                          onChange={(e) => handleCheckboxChange(e, user)}
                          checked={selectedMembers.some(
                            (selectedUser) => selectedUser.name === user.name
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        setDialogType('addMember');
                      }}
                      className="flex items-center justify-center bg-black text-white text-base font-medium rounded-full px-4 py-2 hover:bg-gray-800"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Member
                    </button>
                  </div>
                </>
              )}

              {dialogType === 'addMember' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                      Add Members
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">
                      Search Members
                    </label>
                    <input
                      type="text"
                      placeholder="Type a name..."
                      autoFocus
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        saveMembers();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Add
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'delete' && (
                <>
                  <div className="flex justify-between items-center mb-4 my-2">
                    <h3 className="font-inter text-custom-18 font-semibold leading-custom-21.78 custom-29.7">
                      Confirm Delete
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                  <div className="mt-4 my-4">
                    <p className="font-inter text-custom-18 leading-custom-21.78 font-light my-2">
                      Are you sure you want to delete this item?
                    </p>
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-borderdelete hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        groupToDelete
                          ? handleConfirmDelete()
                          : ConfirmDeleteChannel();
                        setDialogOpen(false);
                      }}
                      className="btn bg-delete text-white rounded-full px-6 py-2 ml-2 hover:bg-red-700 w-36"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'search' && (
                <>
                  <div className="flex items-center justify-between mt-2 w-full max-w-[450px]">
                    <div className="p-2 ml-4 rounded-full border border-black hover:border-customorange focus-within:border-customorange mb-2 flex items-center w-64">
                      <MagnifyingGlassIcon className="h-5 w-5 text-chat" />
                      <input
                        type="text"
                        placeholder={currentSearchPlaceholder}
                        value={
                          currentSearchPlaceholder === 'Search Channels'
                            ? channelSearchQuery
                            : currentSearchPlaceholder === 'Search Group Chats'
                              ? groupChatSearchQuery
                              : directMessageSearchQuery
                        }
                        onChange={(e) => {
                          if (currentSearchPlaceholder === 'Search Channels') {
                            setChannelSearchQuery(e.target.value);
                          } else if (
                            currentSearchPlaceholder === 'Search Group Chats'
                          ) {
                            setGroupChatSearchQuery(e.target.value);
                          } else {
                            setDirectMessageSearchQuery(e.target.value);
                          }
                        }}
                        className="w-full ml-4 focus:outline-none placeholder-chat focus:placeholder-transparent text-chat font:light"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="bg-transparent hover:bg-transparent border-none p-0 mx-4 mb-1"
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
                  <div className="">
                    <List className="">
                      {currentSearchPlaceholder === 'Search Channels' &&
                        filteredChannels.map((channel) => (
                          <ListItem
                            key={channel.id}
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => {
                              setActiveChannel({
                                name: channel.projectName,
                                id: channel.id,
                              });
                              handleCloseDialog();
                            }}
                          >
                            <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                              # {channel.projectName}
                            </Typography>
                          </ListItem>
                        ))}
                      {currentSearchPlaceholder === 'Search Group Chats' &&
                        filteredGroupChats.map((group) => (
                          <ListItem
                            key={group.id}
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => {
                              setActiveChannel({
                                name: group.groupName,
                                id: group.id,
                              });
                              handleCloseDialog();
                            }}
                          >
                            <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                              {group.groupName}
                            </Typography>
                          </ListItem>
                        ))}
                      {/*{Array.isArray(directMessages) && directMessages
              .filter(dm => dm.userId !== session?.user.id)
              .map((dm) => (
              */}
                      {currentSearchPlaceholder === 'Search Members' &&
                        Array.isArray(directMessages) &&
                        directMessages
                          .filter((user) => user.userId !== session?.user.id)
                          .map((user) => (
                            //  filteredUsers.map((user) => (
                            <ListItem
                              key={user.id}
                              className="hover:bg-gray-100 rounded-lg"
                              onClick={() => {
                                setActiveChannel({
                                  name: user.username,
                                  id: user.id,
                                  profileImage:
                                    getUserProfileImage(user.username) ||
                                    '/man.png',
                                  lastSeen: user.lastSeen,
                                  isOnline: user.isOnline,
                                });
                                handleCloseDialog();
                              }}
                            >
                              <ListItemAvatar>
                                {/*}  <Avatar alt={user.userName} src={user.profileImage} /> */}
                                <Avatar
                                  alt={user.username}
                                  src={
                                    getUserProfileImage(user.username) ||
                                    '/man.png'
                                  }
                                />
                              </ListItemAvatar>
                              <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                                {user.username}
                              </Typography>
                            </ListItem>
                          ))}
                    </List>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
/* return (
   <div
     className={`h-full ${isSidebarOpen ? 'block' : ''
       } w-80 bg-white text-black p-3 absolute rounded-3xl z-0 sidebar-container scrollbar-thin scrollbar-thumb-rounded  scrollbar-thumb-[#1c1917] scrollbar-track-[#e7e7eb]`}
     style={{
       paddingRight: '16px',
       overflowY: 'scroll',
     }}
   >
     <div className="">
       <h2 className="font-inter text-custom-18 font-custom-500 text-customorange leading-custom-21.78 text-left py-4 mx-4">
         Recent Messages
       </h2>
       <ul>
         {unreadMessages
           //     .filter((msg) => msg.unreadCount > 0)
           .map((msg) => (
             <li
               key={msg.id}
               className="mb-2 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group"
             >
               <div
                 onClick={() => setActiveChannel({ 'name': msg.user, 'id': msg.user })}
                 className="flex items-center"
               >
                 <Image
                   src={getUserProfileImage(msg.user)}
                   alt={`${msg.user} profile`}
                   width={32}
                   height={32}
                   className="rounded-full mr-2"
                 />
                 <span>{msg.user}</span>
               </div>
               {/*}      <span className="bg-customorange text-white border-4 border-customorange rounded-full flex items-center justify-center w-8 h-8 text-sm font-semibold">
                 {msg.unreadCount}
               </span>  */
{
  /*}              </li>
            ))}
        </ul>
      </div>
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78 text-left py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isChannelsOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleChannels}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleChannels}
            />
          )}
          Channels
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('channels')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton onClick={(event) => handlePlusClick(event, 'channels')}>
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isChannelsOpen && (
        <div>
          <ul>
            {filteredChannels.map((channel) => (
              <li
                key={channel}
                className="mb-2 mx-4 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
              >
                <span onClick={() => setActiveChannel({ 'name': channel, 'id': channel })}>
                  # {channel}
                </span>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer hidden group-hover:block mr-2"
                  onClick={() => handleDeleteChannel(channel)}
                />
              </li>
            ))}
          </ul>
          {showChannelInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Channel"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddChannel}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78  py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isGroupChatsOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleGroupChats}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleGroupChats}
            />
          )}
          Group Chat
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('groupChats')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton onClick={(event) => handlePlusClick(event, 'groupChats')}>
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isGroupChatsOpen && (
        <div>
          <ul>
            {filteredGroupChats.map((group) => (
              <li
                key={group.id}
                className="mb-2 mx-4 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
              >
                <span
                  onClick={() => setActiveChannel({ name: group.groupName, id: group.id })}
                >
                  {group.groupName}
                </span>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer hidden group-hover:block mr-2"
                  onClick={() => handleDeleteGroupChat(group.groupName)}
                />
              </li>
            ))}
          </ul>
          {showGroupChatInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Group Chat"
                value={newGroupChat}
                onChange={(e) => setNewGroupChat(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddGroupChat}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <h2 className="font-inter text-custom-18 font-custom-600 text-heading leading-custom-21.78 text-left py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isDirectMessagesOpen ? (
            <ChevronDownIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleDirectMessages}
            />
          ) : (
            <ChevronUpIcon
              className="h-6 w-6 mx-2 cursor-pointer font-custom-600 text-custom-18 text-heading leading-custom-21.78"
              onClick={toggleDirectMessages}
            />
          )}
          Direct Messages
        </div>
        <div className="flex items-center">
          <IconButton onClick={() => handleSearchClick('directMessages')}>
            <MagnifyingGlassIcon className="h-6 w-6 cursor-pointer text-customorange" />
          </IconButton>
          <IconButton
            onClick={(event) => handlePlusClick(event, 'directMessages')}
          >
            <PlusIcon className="h-6 w-6 cursor-pointer text-customorange border-2 rounded-full border-customorange" />
          </IconButton>
        </div>
      </h2>
      {isDirectMessagesOpen && (
        <div>
          <ul>
            {/*   {directMessages.map((dm) => (   */
}
{
  /*}              {Array.isArray(directMessages) && directMessages
              .filter(dm => dm.userId !== session?.user.id)
              .map((dm) => (
                <li
                  key={dm.id}
                  className="mb-2 flex items-center justify-between cursor-pointer font-inter text-custom-18 font-custom-400 leading-custom-21.78 text-left text-children p-2 rounded group hover:bg-gray-400 hover:text-white"
                >
                    <div
                      onClick={() =>
                        setActiveChannel({
                          name: dm.username,
                          id: [session?.user.id, dm.userId].sort().join('-'),
                        })
                      }
                      className="flex items-center"
                    >
                      <Image
                        src={getUserProfileImage(dm.user) || '/man.png'}
                        alt={`${dm.user} profile`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="mr-2">{dm.username}</span>
                      {isUserOnline(dm.username) ? (
                        <span className="text-green-500">●</span>
                      ) : (
                        <span className="text-gray-500">●</span>
                      )}
                    </div>
                    <XMarkIcon
                      className="h-5 w-5 cursor-pointer hidden group-hover:block"
                      onClick={() => handleDeleteDirectMessage(dm)}
                    />
                    <span className="mr-2">{dm.username}</span>
                    {isUserOnline(dm.username) ? (
                      <span className="text-green-500">●</span>
                    ) : (
                      <span className="text-gray-500">●</span>
                    )}
                  </div>
                  <XMarkIcon
                    className="h-5 w-5 cursor-pointer hidden group-hover:block"
                    onClick={() => handleDeleteDirectMessage(dm)}
                  />
                </li>
              ))}
          </ul>
          {showDirectMessageInput && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Direct Message"
                value={newDirectMessage}
                onChange={(e) => setNewDirectMessage(e.target.value)}
                className="p-2 rounded bg-gray-600 text-white w-full"
              />
              <button
                onClick={handleAddDirectMessage}
                className="mt-2 p-2 bg-blue-500 rounded w-full"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
      <Popper
        open={menuOpen}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        placement="bottom-start"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper
              style={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
            >
              <ClickAwayListener onClickAway={handleCloseMenu}>
                <MenuList
                  autoFocusItem={menuOpen}
                  id="menu-list-grow"
                  className="rounded-3xl bg-dropdown w-auto m-4 shadow-xl"
                  style={{ padding: '15px' }}
                >
                  <MenuItem
                    onClick={() => handleMenuItemClick('create')}
                    className="hover:bg-transparent hover:text-black focus:bg-transparent "
                  >
                    <Image
                      src="/add.png"
                      alt="Create"
                      width={20} // Adjust width according to your needs
                      height={20} // Adjust height according to your needs
                      className="mr-2"
                    />
                    <ListItemText
                      primary={`Create ${currentSection === 'channels'
                        ? 'Channel'
                        : currentSection === 'groupChats'
                          ? 'Group Chat'
                          : 'Direct Message'
                        }`}
                      className="px-4 font-inter p-2 font-extrabold text-[20px] text-black"
                    />
                  </MenuItem>
                  {currentSection !== 'directMessages' && (
                    <MenuItem
                      onClick={() => handleMenuItemClick('delete')}
                      className="hover:bg-transparent hover:text-black focus:bg-transparent "
                    >
                      <Image
                        src="/delete.png"
                        alt="Delete"
                        width={20} 
                        height={20} 
                        className="mr-2"
                      />
                      <ListItemText
                        primary={`Delete ${currentSection === 'channels'
                          ? 'Channel'
                          : 'Group Chat'
                          }`}
                        className="px-4 font-inter p-2 font-extrabold text-[20px] text-black"
                      />
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      {dialogOpen && (
        <>
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-30"></div>
          <div
            className={`modal modal-right-side ${dialogOpen ? 'modal-open' : ''} fixed top-0 right-0 z-50`}
          >
            <div
              className={`modal-box rounded-3xl p-6 right-0 z-50 ${dialogType === 'search' ? 'w-[450px]' : 'w-[600px] '}`}
            >
              {dialogType === 'createChannel' && (
                <>
                  <div className="flex justify-between items-center mb-4 ">
                    <h3 className="font-inter text-custom-18 font-semibold  leading-custom-21.78 custom-29.7 ">
                      Create a channel
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">Name</label>
                    <input
                      type="text"
                      autoFocus
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveDialog();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'createGroupChat' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-custom-18 font-semibold  leading-custom-21.78 custom-29.7">
                      Create a Group Chat
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">Name</label>
                    <input
                      type="text"
                      //   autoFocus
                      name='groupName'
                      value={chatGroupData.groupName}
                      onChange={handleChange}
                      // onChange={(e) => setNewGroupChat(e.target.value)}
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        addChatGroups();
                       // handleSaveDialog();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'createDirectMessage' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-inter text-custom-18 font-semibold  leading-custom-21.78 custom-29.7">
                      Create a Direct Message
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                    <label className="text-borderdelete my-2 mb-4">Name</label>
                    <input
                      type="text"
                      autoFocus
                      value={newDirectMessage}
                      onChange={(e) => setNewDirectMessage(e.target.value)}
                      className="border border-black rounded-full px-4 py-2 w-full focus:outline-none focus:ring-0 hover:border-black"
                    />
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-black hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveDialog();
                        setDialogOpen(false);
                      }}
                      className="btn bg-black text-white rounded-full px-6 py-2 ml-2 hover:bg-gray-800 w-36"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'delete' && dialogOpen &&(
                <>
                  <div className="flex justify-between items-center mb-4 my-2">
                    <h3 className="font-inter text-custom-18 font-semibold  leading-custom-21.78 custom-29.7">
                      Confirm Delete
                    </h3>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
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
                  <div className="mt-4 my-4">
                    <p className="font-inter text-custom-18 leading-custom-21.78 font-light my-2">
                      Are you sure you want to delete this item?
                    </p>
                  </div>
                  <div className="modal-action flex justify-end mt-6">
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="btn border bg-white rounded-full px-6 py-2 mr-2 text-black border-borderdelete hover:bg-gray-200 w-36"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleConfirmDelete();
                        setDialogOpen(false);
                      }}
                      className="btn bg-delete text-white rounded-full px-6 py-2 ml-2 hover:bg-red-700 w-36"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
              {dialogType === 'search' && (
                <>
                  <div className="flex items-center justify-between mt-2 w-full max-w-[450px]">
                    <div className="p-2 ml-4 rounded-full border border-black hover:border-customorange focus-within:border-customorange mb-2 flex items-center w-64">
                      <MagnifyingGlassIcon className="h-5 w-5 text-chat" />
                      <input
                        type="text"
                        placeholder={currentSearchPlaceholder}
                        value={
                          currentSearchPlaceholder === 'Search Channels'
                            ? channelSearchQuery
                            : currentSearchPlaceholder === 'Search Group Chats'
                              ? groupChatSearchQuery
                              : directMessageSearchQuery
                        }
                        onChange={(e) => {
                          if (currentSearchPlaceholder === 'Search Channels') {
                            setChannelSearchQuery(e.target.value);
                          } else if (
                            currentSearchPlaceholder === 'Search Group Chats'
                          ) {
                            setGroupChatSearchQuery(e.target.value);
                          } else {
                            setDirectMessageSearchQuery(e.target.value);
                          }
                        }}
                        className="w-full ml-4 focus:outline-none placeholder-chat focus:placeholder-transparent text-chat font:light"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handleCloseDialog();
                        setDialogOpen(false);
                      }}
                      className="bg-transparent hover:bg-transparent border-none p-0 mx-4 mb-1"
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
                  <div className="">
                    <List className="">
                      {currentSearchPlaceholder === 'Search Channels' &&
                        filteredChannels.map((channel) => (
                          <ListItem
                            key={channel}
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => {
                              setActiveChannel({ name: channel, id: channel });
                              handleCloseDialog();
                            }}
                          >
                            <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                              # {channel}
                            </Typography>
                          </ListItem>
                        ))}
                      {currentSearchPlaceholder === 'Search Group Chats' &&
                        filteredGroupChats.map((group) => (
                          <ListItem
                            key={group.id}
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => {
                              setActiveChannel({ name: group, id: group });
                              handleCloseDialog();
                            }}
                          >
                            <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                              {group.groupName}
                            </Typography>
                          </ListItem>
                        ))}
                      {currentSearchPlaceholder === 'Search Members' &&
                        filteredUsers.map((user) => (
                          <ListItem
                            key={user.name}
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => {
                              setActiveChannel({
                                name: user.name,
                                id: user.name,
                              });
                              handleCloseDialog();
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar alt={user.name} src={user.profileImage} />
                            </ListItemAvatar>
                            <Typography className="font-inter text-custom-18 font-custom-400 leading-custom-21.78">
                              {user.name}
                            </Typography>
                          </ListItem>
                        ))}
                    </List>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
*/
}
export default Sidebar;
