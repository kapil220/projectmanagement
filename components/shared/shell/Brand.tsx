import app from '@/lib/app';
import Image from 'next/image';
import useTheme from 'hooks/useTheme';

const Brand = () => {
  const { theme } = useTheme();
  return (
    <div className="grid pt-2 shrink-0 items-center text-xl font-bold gap-2 dark:text-gray-100">
      <Image
        src={theme !== 'dark' ? '/logo1.png' : ''}
        alt={app.name}
        width={139.49}
        height={54.86}
      />
    </div>
  );
};

export default Brand;
