/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Sidebar from '@/components/chats/sidebar';
import ChatBox from '@/components/chats/chatbox';
import { useRouter } from 'next/router';
import { User, Message, ChatGroup, Project,LastReadTime } from '@/components/chats/type';
//import { json } from 'stream/consumers';
import { useSession } from 'next-auth/react';
import axios from 'axios';
const Chat: React.FC = () => {
  const {
    data: session,
    //  status
  } = useSession();
  const router = useRouter();
  const { id, slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';
 
  const socket = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState<any>({
    name: 'general',
    id: 'general',
  });
  const [isSidebarOpen] = useState<boolean>(true); // Remove setIsSidebarOpen
  const [channels, setChannels] = useState<string[]>([]);
  const [groupChats, setGroupChats] = useState<ChatGroup[]>([]);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] = useState<boolean>(false);
  const [isGroupChatsOpen, setIsGroupChatsOpen] = useState<boolean>(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState<boolean>(true);
  const [channelsList, setChannelsList] = useState<Project[]>([]);
  //const [recentUserIds, setRecentUserIds] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
 
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [lastSeenTime, setLastSeenTime] = useState<string>();
  const [lastActiveUserOrGroup, setLastActiveUserOrGroup] = useState<string>();
  const [chatMessages, setChatMessages] = useState<{
    [key: string]: Message[];
  }>({
    /* 'general': [
       {
         id: 1, // Ensure this is a number
         user: 'John Doe',
         type: 'text',
         message: 'Hello everyone!',
         timestamp: '10:30 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 0, // Add this
       },
       {
         id: 2, // Ensure this is a number
         user: 'Jane S   mith',
         type: 'text',
         message: 'Hi John, how are you?',
         timestamp: '10:32 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 0, // Add this
       },
     ],
     'Team A': [
       {
         id: 3, // Ensure this is a number
         user: 'Alice',
         type: 'text',
         message: 'Team A message 1',
         timestamp: '09:00 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 0,
       },
     ],
     'Marketing': [
       {
         id: 4, // Ensure this is a number
         user: 'Bob',
         type: 'text',
         message: 'Marketing message 1',
         timestamp: '09:15 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 0, // Add this
       },
     ],
     'John Doe': [
       {
         id: 5, // Ensure this is a number
         user: 'John Doe',
         type: 'text',
         message: 'Hello there!',
         timestamp: '11:00 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 4, // Add this
       },
       {
         id: 6, // Ensure this is a number
         user: 'You',
         type: 'text',
         message: 'Hi John!',
         timestamp: '11:05 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 2, // Add this
       },
     ],
     'Jane Smith': [
       {
         id: 7, // Ensure this is a number
         user: 'Jane Smith',
         type: 'text',
         message: 'Hi there!',
         timestamp: '11:15 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 4, // Add this
       },
       {
         id: 8, // Ensure this is a number
         user: 'You',
         type: 'text',
         message: 'Hello Jane!',
         timestamp: '11:20 AM',
         date: '2023-07-03',
         isRead: false,
         unreadCount: 0, // Add this
       },
     ],
     random: [],
     'project-x': [],
     */
  });

  const [onlineUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      isOnline: true,
      lastSeen: '',
      profileImage: '/man.png',
    },
    {
      id: '2',
      name: 'Jane Smith',
      isOnline: false,
      lastSeen: '2023-07-04 10:15',
      profileImage: '/man.png',
    },
    {
      id: '3',
      name: 'Alice',
      isOnline: false,
      lastSeen: '2023-07-04 10:15',
      profileImage: '/man.png',
    },
    {
      id: '4',
      name: 'Bob',
      isOnline: true,
      lastSeen: '',
      profileImage: '/man.png',
    },
    {
      id: '5',
      name: 'You',
      isOnline: true,
      lastSeen: '',
      profileImage: '/man.png',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null); // Add replyTo state

  const currentUser = onlineUsers.find((user) => user.name === 'You');
  const activeUser =
    onlineUsers.find((user) => user.name === activeChannel.name) ||
    onlineUsers.find((user) => user.name === lastActiveUserOrGroup);
  const activeGroup =
    channels.includes(activeChannel.id) || groupChats.includes(activeChannel.id)
      ? activeChannel.name
      : lastActiveUserOrGroup;

  useEffect(() => {
    setMessages(chatMessages[activeChannel.id] || []);
    setLastActiveUserOrGroup(activeChannel.name);
  }, [chatMessages]);
  useEffect(() => {
    fetchMessages();
   }, [activeChannel]);
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setMessages(chatMessages[activeChannel.id] || []);
    } else {
      const filteredMessages = (chatMessages[activeChannel.id] || []).filter(
        (msg) => msg.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setMessages(filteredMessages);
    }
  }, [searchQuery, chatMessages]);

  useEffect(() => {
    console.log('CHAT_PUBLIC_URL (before socket):', process.env.NEXT_PUBLIC_CHAT_URL);

    socket.current = io(`${process.env.NEXT_PUBLIC_CHAT_URL}`);
    //console.log("Active channel", activeChannel);
    socket.current.on('connect', () => {
      socket.current!.emit('join', activeChannel.id);
      //console.log('Socket.IO connection established');
    });

    socket.current.on('message', (data: any) => {
      try {
        const parsedMessage = JSON.parse(data);
        //console.log('Message from server:', parsedMessage);
        console.log('Inside mesaage received', parsedMessage);
        if (
          parsedMessage.event === 'chat' &&
          parsedMessage.message.sender != session?.user.id
        ) {
          console.log('Inside mesaage received messages updated');
          //setMessages((prevMessages) => [...prevMessages, parsedMessage.message]);
          setChatMessages((prevMessages) => ({
            ...prevMessages,
            [activeChannel.id]: [
              ...(prevMessages[activeChannel.id] || []),
              parsedMessage.message,
            ],
          }));
          //console.log('Messages:', parsedMessage.message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    socket.current.on('disconnect', () => {
      console.log('Socket.IO connection closed');
    });
    socket.current.on('error', (error: any) => {
      console.error('Socket.IO error:', error);
    });
    /* const allUnreadMessages = Object.values(chatMessages)
        .flat()
        .filter((msg) => !msg.isRead && msg.user !== currentUser?.name);
      setUnreadMessages(allUnreadMessages);
      return () => {
        socket.current?.close();
      };
      */
  }, [currentUser, activeChannel]);

  const handleUploadDocument = () => {
    console.log('Upload Document Clicked');
    // Your logic here
  };

  const handleAddLink = () => {
    console.log('Add Link Clicked');
    // Your logic here
  };

  const handleNotifications = () => {
    console.log('Notifications Clicked');
    // Your logic here
  };

  const handleVoiceMessage = () => {
    console.log('Voice Message Clicked');
    // Your logic here
  };

  const handleUploadPhoto = () => {
    console.log('Upload Photo Clicked');
    // Your logic here
  };
  const handleSendMessage = (content: {
    type: 'text' | 'image' | 'audio';
    content: string;
    repliedTo?: number; 
  }) => {
    const now = new Date();
    const newMessage: Message = {
      id: (chatMessages[activeChannel.id]?.length || 0) + 1, 
      user: currentUser!.name,
      type: content.type,
      message: content.content,
      timestamps: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: now.toISOString().split('T')[0],
      sender: session?.user.id || '',
      receiver: activeChannel.id,
      channel_id: activeChannel.id,
      createdAt: '',
    };

    console.log('Chat messages:', chatMessages[activeChannel.id]);
    //setChatMessages({ ...chatMessages, [activeChannel.id]: updatedMessages });
    setChatMessages((prevMessages) => ({
      ...prevMessages,
      [activeChannel.id]: [
        ...(prevMessages[activeChannel.id] || []),
        newMessage,
      ],
    }));
    console.log('Updated chat messages:', chatMessages[activeChannel.id]);

    if (socket.current && newMessage) {
      const inputBody = {
        event: 'chat',
        message: newMessage,
        channel_id: activeChannel.id,
      };
      socket.current.send(JSON.stringify(inputBody));
      setMessage('');
    }
  };

  const handleReply = (message: Message) => {
    console.log('Reply to message:', message);
    setReplyTo(message); // Set the replyTo state when replying to a message
  };

  const handleReact = (message: Message, reaction: string) => {
    console.log('React to message:', message, 'with reaction:', reaction);
    // Your logic here
  };

  const handleStar = (message: Message) => {
    console.log('Star message:', message);
    // Your logic here
  };
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/team-member');
      // const userName = response.data.data;
      console.log('response of user list', response.data.data[0].username);

      //  setDirectMessages(response.data.map((user: User) => user.name));
      //setDirectMessages(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const saveLastSeenTime = async (userId: any, channelId: string, teamId: string) => {
    try {
      const response = await axios.post('/api/last-read-time', {userId, channelId,teamId} );
      console.log("Response data:", response);
    } catch (error) {
      console.error('Error saving last seen time', error);
    }
  };
  const getLastSeenTime = async (userId: string, channelId: string, teamId: string) => {
    try {
      const response = await axios.get("/api/last-read-time?userId="+userId+"&teamId="+teamId+"&channelId="+channelId);
      console.log("Last read time:", response);
      setLastSeenTime(response.data.lastReadTime);
      //if (response.data && response.data.data.lastReadTime)
    } catch (error) {
      console.error('Error saving last seen time', error);
    }
  };
  // Fetch messages when the active channel changes
  const fetchMessages = async () => {
    console.log('In fetchMessages-------');
    try {
      console.log('CHAT_PUBLIC_URL:', process.env.NEXT_PUBLIC_CHAT_URL);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_CHAT_URL}/api/messages/${activeChannel.id}`);
      setChatMessages(prevMessages => ({
        ...prevMessages,
        [activeChannel.id]: response.data,
      }));
      if(activeChannel.type == 'Direct Message' ) {
        saveLastSeenTime(session?.user.id, activeChannel.id, teamId);
        getLastSeenTime(activeChannel.toUserId, activeChannel.id, teamId);
      }
        console.log('Messages fetched from API:', response);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  const fetchChatGroup = async () => {
    try {
      const response = await axios.get('/api/chatGroups');
      const newData = response.data.data;
      console.log("newData from user's groups", newData);
     
    const groupNames = newData
    .filter((group: any) => group.status !== false)
    .map((group: any) => ({
      id: group.id,
      groupName: group.groupName,
      user_id: group.user_id, 
      status: group.status,
      teamId: group.teamId,    
    }));
    console.log("groupNames-----",groupNames);
    
      //setGroupChats(groupNames);
      return groupNames;
    } catch (error) {
      console.error('Error fetching userlist', error);
      return [];
    }
  };
  const fetchChannelList = async () => {
    try {
      const response = await axios.get('/api/projects');
      const newData = response.data.data;
      console.log('newData from channels list', newData);
      const activeChannels = newData.filter(channel => channel.status === true);
      console.log("activeChannels  list----", activeChannels);
      //setChannelsList(activeChannels);
      return activeChannels;
    } catch (error) {
      console.error('Error fetching projectlist', error);
      return [];
    }
  };
  const fetchRecentUser = async () => {
    try {
      const response = await axios.get(`/api/team-member?action=lastSeenTime&user_id=${session?.user.id}`);
      const newData = response.data;
      console.log('newData from recent user', newData);
      //setRecentUserIds(newData.senders);
      return newData.senders;
    } catch (error) {
      console.error('Error fetching recent user', error);
      return [];
    }
  }; 
const updateAllChannels = (users: any, channels: any, groups:any, recentUserIds:any) => {
    console.log("Inside update all channels", recentUserIds);
    let recentUsers:any = [];
    const matchingIds = recentUserIds.map(obj => obj.channel_id);

    // Filter items based on matching ids
    const matchingDirectMessages = users.filter(item => matchingIds.includes([session?.user.id, item.userId].sort().join('-')));

    recentUsers = [...recentUsers, ...matchingDirectMessages];
    // Remove matching items from the original items list
    console.log("Before modifying direct messages", directMessages)
    const remainingDirectMessages = users.filter(item => !matchingIds.includes([session?.user.id, item.userId].sort().join('-')));
    setDirectMessages(remainingDirectMessages);
    console.log("Remaining Direct messages:", remainingDirectMessages); 
    const matchingChannelList = channels.filter(item => matchingIds.includes(item.id));
    const remainingChannelList = channels.filter(item => !matchingIds.includes(item.id));
    recentUsers = [...recentUsers, ...matchingChannelList];
    setChannelsList(remainingChannelList);

    const matchingGroupChats = groups.filter(item => matchingIds.includes(item.id));
    const remainingGroupChats = groups.filter(item => !matchingIds.includes(item.id));
    recentUsers = [...recentUsers, ...matchingGroupChats];
    setGroupChats(remainingGroupChats);

    setRecentUsers(recentUsers);
    console.log("Recent users:", recentUsers)
}
useEffect(() => {
  const fetchInitialData = async () => {
    const users = await fetchUsers();
    const channels = await fetchChannelList();
    const groups = await fetchChatGroup();
    const recentUserIds = await fetchRecentUser();

    updateAllChannels(users, channels, groups, recentUserIds); // Call the function after all states are updated
  };

  fetchInitialData(); 
}, []); 

 
  return (
    <div className="flex gap-20">
      <div className="flex-none w-64">
      <Sidebar
          channels={channels}
          groupChats={groupChats}
          setGroupChats={setGroupChats}
          directMessages={directMessages}
          isSidebarOpen={isSidebarOpen}
          setActiveChannel={setActiveChannel}
          updateChannels={setChannels}
          updateGroupChats={setGroupChats}
          updateDirectMessages={setDirectMessages}
          onlineUsers={onlineUsers}
          unreadMessages={unreadMessages}
          fetchChatGroup={fetchChatGroup}
          recentUsers={recentUsers}
        />
      </div>
      <div className="flex-grow">
        <ChatBox
          activeUser={activeUser}
          activeGroup={activeGroup}
          setSearchQuery={setSearchQuery}
          messages={messages}
          currentUser={currentUser!.name}
          onlineUsers={onlineUsers}
          onUploadDocument={handleUploadDocument}
          onAddLink={handleAddLink}
          onNotifications={handleNotifications}
          onVoiceMessage={handleVoiceMessage}
          onUploadPhoto={handleUploadPhoto}
          handleReply={handleReply}
          handleReact={handleReact}
          handleStar={handleStar}
          handleSendMessage={(content) => {
            handleSendMessage({
              ...content,
              repliedTo: replyTo ? replyTo.id : undefined,
            });
            setReplyTo(null); // Clear the replyTo state after sending a message
          }}
          isDirectMessagesOpen={isDirectMessagesOpen}
          isGroupChatsOpen={isGroupChatsOpen}
          isChannelsOpen={isChannelsOpen}
          activeChannel={activeChannel}
          lastSeenTime={lastSeenTime}
          directMessages={directMessages}
          recentUsers={recentUsers}

        />
      </div>
    </div>
  );
};

export default Chat;