import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import Image from 'next/image';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiClick: (emojiObject: any) => void;
}

const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  onClose,
  onEmojiClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full mb-2 right-0 bg-white p-4 rounded-3xl shadow-lg w-[400px] h-[460px] flex flex-col z-50">
      <div className="flex-grow overflow-y-scroll">
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          // Removed pickerStyle prop
          className="w-full shadow-none border-none" // Add any necessary styling here
        />
      </div>
      <div className="flex justify-between mt-2">
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <Image src={'/key.png'} alt="Language" width={38} height={38} />
        </button>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <Image src={'/abcd.png'} alt="Voice" width={18} height={18} />
        </button>
      </div>
    </div>
  );
};

export default EmojiPickerModal;
