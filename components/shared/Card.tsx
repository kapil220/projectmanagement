import React from 'react';

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="card w-full bg-white dark:bg-zinc-950 border border-gray-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
      {children}
    </div>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="card-title text-xl font-bold tracking-tight text-gray-900 dark:text-white">
      {children}
    </h2>
  );
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{children}</div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex gap-1.5 flex-col mb-4">{children}</div>;
};

const Body = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-body gap-5 p-6 md:p-8 rounded-t-3xl">{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="card-actions justify-end px-6 md:px-8 py-4 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/40 dark:bg-zinc-900/10 rounded-b-3xl">
      {children}
    </div>
  );
};

Card.Body = Body;
Card.Title = Title;
Card.Description = Description;
Card.Header = Header;
Card.Footer = Footer;

export default Card;

