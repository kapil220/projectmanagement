/* eslint-disable i18next/no-literal-string */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, {useState} from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Message, User ,LastReadTime} from './type';
import { current } from 'tailwindcss/colors';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface MessageDisplayProps {
  messages: Message[];
  currentUser: string;
  onlineUsers: User[];
  handleReply: (message: Message) => void;
  handleReact: (message: Message, reaction: string) => void;
  handleStar: (message: Message) => void;
}
const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  currentUser,
  onlineUsers,
}) => {
  const {
    data: session,
    //  status
  } = useSession();
  const { t } = useTranslation();
  const { query } = useRouter();
  const { slug } = query as { slug: string };

  const getUserProfileImage = (user: string): string => {
    const foundUser = onlineUsers.find((u) => u.name === user);
    return foundUser ? foundUser.profileImage : '';
  };

  const getRepliedMessageContent = (repliedTo: number | undefined): string => {
    console.log('getRepliedMessageContent called with repliedTo:', repliedTo);

    const repliedMessage = messages.find((msg) => msg.id === repliedTo);
    console.log('Replied message found:', repliedMessage);

    return repliedMessage ? repliedMessage.message : '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };
  return (
    <div className="flex-1 bg-white overflow-y-auto p-4">
      {messages.map((msg, index) => {
        const isCurrentUser = msg.sender === session?.user.id;
        const isSameUserAsPrevious =
          index > 0 && messages[index - 1].user === msg.user;
        const isLastMessageFromUser =
          index === messages.length - 1 ||
          messages[index + 1].user !== msg.user;
        const showProfileImage = !isSameUserAsPrevious;

        return (
          <div
            key={msg.id}
            className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-4`}
          >
      {/*      {!isCurrentUser && showProfileImage && (
              <div className="mr-2">
                <Image
                  src={getUserProfileImage(msg.user)}
                  alt={`${msg.user} profile`}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            )}  */}
            <div
              className={`max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}
            >
              {/*}        {msg.repliedTo && (
                <div className="bg-gray-100 text-gray-500 text-sm p-2 rounded-lg mb-1">
                  <strong>{t('replyingTo')}</strong>{' '}
                  {getRepliedMessageContent(msg.repliedTo)}
                </div>
      )}  */}
              <div
                className={`p-3 rounded-xl shadow ${isCurrentUser ? 'bg-customorange text-white' : 'bg-gray-200 text-black'}`}
              >
                {msg.message}
              </div>
              <div className="text-chat text-[10px] mt-1 font-light leading-[9.68px] italic">
              {/*}  {formatDate(msg.createdAt)} */}
                        {msg.timestamps} - {msg.date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageDisplay;

/*
  return (
    <div className="flex-1 bg-white overflow-y-auto p-4">
      {messages.map((msg, index) => {
        const isCurrentUser = msg.user === currentUser;
        const isSameUserAsPrevious =
          index > 0 && messages[index - 1].user === msg.user;
        const isLastMessageFromUser =
          index === messages.length - 1 ||
          messages[index + 1].user !== msg.user;
        const showProfileImage = !isSameUserAsPrevious;

        return (
          <div
            key={msg.id}
            className={`group flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${showProfileImage ? 'mt-4' : ''}`}
          >
            {!isCurrentUser && (
              <div className="flex items-start">
                {showProfileImage ? (
                  <div className="mr-2">
                    <Image
                      src={getUserProfileImage(msg.user)}
                      alt={`${msg.user} profile`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 mr-2"></div> // Empty space for profile image
                )}
{/*<div className="max-w-xs">  */
/*<div className={`max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>

                  {msg.repliedTo && (
                    <div className="bg-gray-100 text-gray-500 text-sm p-2 rounded-lg mb-1">
                      <strong>{t('replyingTo')}</strong>{' '}
                      {getRepliedMessageContent(msg.repliedTo)}
                    </div>
                  )}
                  <div
            //        className={`p-3 rounded-xl shadow ${isSameUserAsPrevious ? 'mt-0' : ''}`}
            className={`p-3 rounded-xl shadow ${isCurrentUser ? 'bg-customorange text-white' : 'bg-gray-200 text-black'}`}

                    style={{
                      backgroundColor: 'rgba(247, 247, 247, 1)',
                      color: 'rgba(28, 25, 23, 1)',
                      fontSize: '15px',
                      lineHeight: '18.15px',
                      textAlign: 'left',
                      fontWeight: '300',
                    }}
                  >
           {/*         {msg.type === 'text' && msg.content}
                    {msg.type === 'image' && (
                      <Image
                        src={msg.content}
                        alt="image content"
                        width={400}
                        height={300}
                        className="rounded"
                      />
                    )}
                    {msg.type === 'audio' && (
                      <audio controls src={msg.content} className="w-full" />
                    )} */
/*                    {msg.message}
                 </div>
                 {isLastMessageFromUser && (
     <div className="text-chat  text-[10px] mt-1 font-light leading-[9.68px] text-righ italict">          
           {/*       <div className="text-chat text-[8px] mt-1 font-light leading-[9.68px] text-right">*/
{
  /*}      {msg.timestamp} - {formatDate(msg.date)}  */
}
{
  /*}      {formatDate(msg.timestamp)}  */
}
/*             {msg.timestamp} - {msg.date}
                    </div>
                  )}
                </div>
              </div>
            )}
            {isCurrentUser && (
              <div className="flex items-start flex-row-reverse">
                {showProfileImage ? (
                  <div className="ml-2">
                    <Image
                      src={getUserProfileImage(msg.user)}
                      alt={`${msg.user} profile`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 ml-2"></div> // Empty space for profile image
                )}
                <div className="max-w-xs">
                  {msg.repliedTo && (
                    <div className="bg-gray-100 text-gray-500 text-sm p-2 rounded-lg mb-1">
                      <strong>{t('replyingTo')}</strong>{' '}
                      {getRepliedMessageContent(msg.repliedTo)}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-full shadow ${
                      isSameUserAsPrevious ? 'mt-2' : ''
                    } bg-customorange text-white`}
                    style={{
                      fontSize: '15px',
                      lineHeight: '18.15px',
                      textAlign: 'left',
                      fontWeight: '300',
                    }}
                  >
                    {msg.type === 'text' && msg.message}
                    {msg.type === 'image' && (
                      <Image
                        src={msg.message}
                        alt="image content"
                        width={400}
                        height={300}
                        className="rounded"
                      />
                    )}
                    {msg.type === 'audio' && (
                      <audio controls src={msg.message} className="w-full" />
                    )}
                  </div>
                  {isLastMessageFromUser && (
                    <div className={`w-full flex justify-start`}>
                      <div className="text-chat text-[10px] mt-1 font-light leading-[9.68px] italic">
                        {msg.timestamp} - {formatDate(msg.date)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageDisplay;
*/
