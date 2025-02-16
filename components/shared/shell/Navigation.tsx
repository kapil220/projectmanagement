import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  isBottom?: boolean;
  isHovered: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isBottom, isHovered }) => {
  const { asPath, isReady, query } = useRouter();
  const [activePathname, setActivePathname] = useState<string | null>(null);
  const { t } = useTranslation();
  const { slug } = query as { slug: string };

  useEffect(() => {
    if (isReady && asPath) {
      const activePathname = new URL(asPath, location.href).pathname;
      setActivePathname(activePathname);
    }
  }, [asPath, isReady]);

  if (isBottom) {
    return (
      <nav className="flex flex-1 flex-col w-full">
        <a
          href={`/teams/${slug}/settings`}
          className={`flex items-center justify-center p-2 transition-all duration-300 
            ${activePathname === `/teams/${slug}/settings` ? 'bg-heading text-customorange border-l-4 border-customorange' : 'hover:bg-heading text-white'} 
            w-full rounded-lg`}
        >
          <Image
            src="/settings.png"
            alt="Settings"
            width={24}
            height={24}
            className={`w-6 h-6 ${
              activePathname === `/teams/${slug}/settings`
                ? 'filter-custom-active'
                : 'filter-custom-default'
            }`}
          />
          <div
            className={`ml-4 whitespace-nowrap ${isHovered ? 'block' : 'hidden'} transition-opacity duration-300`}
          >
            <span>{t('Settings')}</span>
          </div>
        </a>
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col">
      {slug ? (
        <TeamNavigation
          activePathname={activePathname}
          slug={slug}
          isHovered={isHovered}
        />
      ) : (
        // @ts-expect-error UserNavigation component does not have isHovered prop in its definition
        <UserNavigation activePathname={activePathname} isHovered={isHovered} />
      )}
    </nav>
  );
};

export default Navigation;
