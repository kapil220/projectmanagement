import React, { useState } from 'react';
import Navigation from './Navigation';
import Image from 'next/image'; // Assuming you are using Next.js

interface DrawerProps {
  onLockChange: (locked: boolean) => void;
  onHoverChange: (hovered: boolean) => void;
  isHovered: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  onLockChange,
  onHoverChange,
  isHovered,
}) => {
  const [isLocked, setIsLocked] = useState(false);

  const toggleLock = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    onLockChange(newLockState); // Notify parent component of lock state change
  };

  return (
    <div
      className={`h-full z-50 bg-drawercolor flex flex-col justify-between items-center p-6 transition-all duration-300  absolute rounded-3xl ${
        isLocked ? 'w-56 bg-drawercolor' : isHovered ? 'w-56' : 'w-24'
      }`}
      onMouseEnter={() => !isLocked && onHoverChange(true)}
      onMouseLeave={() => !isLocked && onHoverChange(false)}
      style={{
        backgroundColor: !isLocked && isHovered ? 'rgba(0, 0, 0, 0.7)' : '', // Apply transparency only when not locked and hovered
      }}
    >
      {/* Top section: Lock/Unlock Button and Navigation */}
      <div className="w-full">
        {/* Lock/Unlock Button */}
        <div className="w-full flex justify-end mb-4">
          <button onClick={toggleLock} className="p-2">
            <Image
              src={isLocked ? '/close.png' : '/open.png'}
              alt={isLocked ? 'Locked' : 'Unlocked'}
              width={32}
              height={32}
              className="h-8 w-8 filter brightness-75 hover:brightness-50"
            />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col ml-2 w-full items-center p-4 space-y-4">
          <Navigation isHovered={isHovered || isLocked} />
        </div>
      </div>

      {/* Bottom section: Settings */}
      <div className="flex flex-col items-center w-full">
        {(isHovered || isLocked) && (
          <div className="w-full ml-2 border-t border-white my-4"></div>
        )}
        <Navigation isBottom isHovered={isHovered || isLocked} />
      </div>
    </div>
  );
};

export default Drawer;
