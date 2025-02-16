import React, { useState } from 'react';
import TopBar from './topbar';
import MessageDisplay from './messagedisplay';
import MessageInput from './messageinput';
import { User as UserData, Message } from './type';

interface ChatBoxProps {
  activeUser: UserData | undefined;
  activeGroup: string;
  setSearchQuery: (query: string) => void;
  messages: Message[];
  currentUser: string;
  onlineUsers: UserData[];
  onUploadDocument: () => void;
  onAddLink: () => void;
  onNotifications: () => void;
  onVoiceMessage: () => void;
  onUploadPhoto: () => void;
  handleReply: (message: Message) => void;
  handleReact: (message: Message, reaction: string) => void;
  handleStar: (message: Message) => void;
  isDirectMessagesOpen: boolean;
  isGroupChatsOpen: boolean;
  isChannelsOpen: boolean;
  directMessages: any[]; 
/*  groupChats: any[]; // Adjust according to your type
  setGroupChats: (groupChats: any[]) => void;
  type: string; */
  handleSendMessage: (content: {
    type: 'text' | 'image' | 'audio';
    content: string;
    repliedTo?: number; // Ensure this is a number
  }) => void;
  activeChannel: any;
  lastSeenTime:any;
recentUsers: any[];
}

const ChatBox: React.FC<ChatBoxProps> = ({
  activeUser,
  activeGroup,
  setSearchQuery,
  messages,
  currentUser,
  onlineUsers,
  onUploadDocument,
  onAddLink,
  onNotifications,
  onVoiceMessage,
  onUploadPhoto,
  handleReply,
  handleReact,
  handleStar,
  handleSendMessage,
  isDirectMessagesOpen,
  isGroupChatsOpen,
  isChannelsOpen,
  directMessages,
 /* groupChats,
  setGroupChats,
  type,  */
  activeChannel,
  lastSeenTime,
  recentUsers
}) => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  return (
    <div className="flex flex-col bg-white rounded-2xl p-4 h-screen w-full ">
      <div className="flex-none">
        <TopBar
          activeUser={activeUser}
          activeGroup={activeGroup}
          setSearchQuery={setSearchQuery}
          onUploadDocument={onUploadDocument}
          onAddLink={onAddLink}
          onNotifications={onNotifications}
          onVoiceMessage={onVoiceMessage}
          onUploadPhoto={onUploadPhoto}
          isDirectMessagesOpen={isDirectMessagesOpen}
          isGroupChatsOpen={isGroupChatsOpen}
          isChannelsOpen={isChannelsOpen}
            user={activeUser!} 
          activeChannel={activeChannel}
          message={messages[0] || {} as Message}
          lastSeenTime={lastSeenTime}
          directMessages={directMessages}
          recentUser={recentUsers}
      /*    groupChats={groupChats}
          setGroupChats={setGroupChats}
          type={type} */
        
          />
      </div>
      <div className="flex-grow overflow-y-auto">
        <MessageDisplay
          messages={messages}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          handleReply={(message) => {
            handleReply(message);
            setReplyTo(message); // Set replyTo state when replying to a message
          }}
          handleReact={handleReact}
          handleStar={handleStar}
        />
      </div>
      <div className="flex-none">
        <MessageInput
          handleSendMessage={(content) => {
            handleSendMessage({
              ...content,
              repliedTo: replyTo ? replyTo.id : undefined,
            });
            setReplyTo(null); // Clear the replyTo state after sending a message
          }}
          replyTo={replyTo}
          setReplyTo={setReplyTo}
        />
      </div>
    </div>
  );
};

export default ChatBox;
