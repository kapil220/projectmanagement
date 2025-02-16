import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from './Header';
import Drawer from './Drawer';
import { ViewModeProvider } from '../../../context/viewmodecontext';
import { useState } from 'react';

export default function AppShell({ children }) {
  const router = useRouter();
  const { status } = useSession();
  const [isDrawerLocked, setIsDrawerLocked] = useState(false); // State to track if drawer is locked
  const [isDrawerHovered, setIsDrawerHovered] = useState(false); // State to track if drawer is hovered

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null; // Make sure to return something in all cases
  }

  const handleDrawerLock = (locked) => {
    setIsDrawerLocked(locked);
  };

  const handleDrawerHover = (hovered) => {
    setIsDrawerHovered(hovered);
  };

  return (
    <ViewModeProvider>
      <div className="flex flex-col h-svh">
        <Header />
        <div className="flex flex-1 bg-backgroundcolor h-full">
          <div
            className={`transition-all pl-8 duration-300 ${isDrawerLocked ? 'w-44' : 'w-16'}`}
          >
            <Drawer
              onLockChange={handleDrawerLock}
              onHoverChange={handleDrawerHover} // Pass hover state handler
              isHovered={isDrawerHovered}
            />
          </div>
          <div
            className={`flex-1 px-12 overflow-auto transition-all duration-300 ${isDrawerLocked ? 'ml-12' : 'ml-8'}`}
          >
            <main>
              <div>{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ViewModeProvider>
  );
}
