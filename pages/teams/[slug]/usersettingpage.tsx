/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Modal = ({
  title,
  children,
  isOpen,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 h-scroll bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ '--tw-space-y-reverse': 'unset' } as React.CSSProperties}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl p-8 w-[600px] relative"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold font-poppins">{title}</h2>
          <button onClick={onClose}>
            <Image
              src="/x.png"
              alt="Close"
              width={32}
              height={32}
              className="h-8 w-8 filter brightness-75 hover:brightness-50"
            />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const UserSettingsPage = () => {
  const [user, setUser] = useState({
    firstName: 'Tanveer',
    lastName: '',
    email: 'tanveer@gmail.com',
    playSound: true,
    darkSidebar: false,
    firstDayOfWeek: 'Monday',
  });

  const [isChangeEmailOpen, setChangeEmailOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState(false);

  const handleToggle = (field: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: !prevUser[field as keyof typeof user],
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleDeleteAccount = () => {
    if (confirmDeletion) {
      // Logic to delete the account goes here
      console.log('Account deleted');
      setDeleteAccountOpen(false);
    }
  };

  return (
    <div className="w-full h-screen rounded-3xl p-6 mx-auto py-8 space-y-8 bg-white">
      <div className="w-3/5">
        <div className="">
          <h2 className="text-xl font-semibold font-inter">My Settings</h2>
          <div className="flex gap-16">
            <div className=" mt-6">
              <img
                src="/moon.png" // Replace with actual image path
                alt="User"
                className="w-[120px] h-[120px] rounded-full"
              />
            </div>
            <div className="grow pr-32">
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-base font-medium text-head">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                    className="mt-1 p-2 block text-lg font-inter w-full border border-borderdelete rounded-md shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-head">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                    className="mt-1 p-2 block text-lg font-inter w-full border border-borderdelete rounded-md shadow-sm focus:outline-none sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-base font-medium text-head">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 p-2 text-lg font-inter block w-full border border-borderdelete rounded-md shadow-sm focus:outline-none sm:text-sm"
                />
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="px-4 py-2 w-[143px] h-[32px] text-xs font-inter text-white border bg-black rounded-md"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setChangeEmailOpen(true)}
                  className="px-4 py-2 font-medium w-[143px] h-[32px] text-xs font-inter text-white border bg-black rounded-md"
                >
                  Change Email
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-medium text-gray-900">Preferences</h3>
            <div className="flex space-x-8">
              {/* Play task completion sound */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggle('playSound')}
                  className={`${
                    user.playSound ? 'bg-green-500' : 'bg-red-500'
                  } relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out`}
                >
                  <span className="sr-only">Toggle</span>
                  <span
                    className={`${
                      user.playSound ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                  />
                  <span
                    className={`${
                      user.playSound
                        ? 'absolute left-1 text-white text-xs'
                        : 'absolute right-1 text-white text-xs'
                    }`}
                  >
                    {user.playSound ? 'ON' : 'OFF'}
                  </span>
                </button>
                <span className="text-base text-chat font-inter">
                  Play task completion sound
                </span>
              </div>

              {/* Dark Sidebar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggle('darkSidebar')}
                  className={`${
                    user.darkSidebar ? 'bg-green-500' : 'bg-red-500'
                  } relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out`}
                >
                  <span className="sr-only">Toggle</span>
                  <span
                    className={`${
                      user.darkSidebar ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                  />
                  <span
                    className={`${
                      user.darkSidebar
                        ? 'absolute left-1 text-white text-xs'
                        : 'absolute right-1 text-white text-xs'
                    }`}
                  >
                    {user.darkSidebar ? 'ON' : 'OFF'}
                  </span>
                </button>
                <span className="text-base font-inter text-chat">
                  Dark Sidebar
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-inter font-medium">
              First day of week
            </h3>
            <div className="mt-4 space-x-4">
              <button
                className={`px-4 py-2 w-[123px]  text-xs  h-[32px] font-medium rounded-md ${
                  user.firstDayOfWeek === 'Monday'
                    ? 'bg-black text-white'
                    : 'border border-borderdelete text-gray-900'
                }`}
                onClick={() => handleInputChange('firstDayOfWeek', 'Monday')}
              >
                Monday
              </button>
              <button
                className={`px-4 py-2 font-medium w-[123px] text-xs h-[32px] items-center justify-between rounded-md ${
                  user.firstDayOfWeek === 'Sunday'
                    ? 'bg-black text-white'
                    : 'border border-borderdelete text-gray-900'
                }`}
                onClick={() => handleInputChange('firstDayOfWeek', 'Sunday')}
              >
                Sunday
              </button>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 text-xs h-[32px] w-[123px] font-medium text-white bg-black rounded-md">
            Save Changes
          </button>
          <div className="mt-10">
            <h3 className="text-xl font-inter font-medium">Delete Account</h3>
            <p className="mt-2 text-base text-borderdelete font-inter w-2/3">
              After deleting your account you will lose all related information
              including tasks, events, projects, notes etc. You will not be able
              to recover it later, so think twice before doing this.
            </p>
            <button
              onClick={() => setDeleteAccountOpen(true)}
              className="mt-4 text-delete font-inter text-base font-medium hover:underline"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      <Modal
        title="Change Email"
        isOpen={isChangeEmailOpen}
        onClose={() => setChangeEmailOpen(false)}
      >
        <p className="text-sm text-borderdelete font-poppins mt-4">
          If you sign up for a Taskiyo account using Google and don’t have a
          password, log out, and then request to add to your Taskiyo account.{' '}
          <a href="#" className="text-borderdelete font-poppins">
            Learn more
          </a>
        </p>
        <div className="mt-4">
          <label className="block text-lg font-medium font-poppins text-borderdelete">
            Your current password
          </label>
          <input
            type="password"
            className="mt-1 block w-full border border-borderdelete rounded-xl shadow-sm p-2"
            placeholder="Your current password"
          />
        </div>
        <div className="mt-4">
          <label className="block text-lg font-medium font-poppins text-borderdelete">
            New email
          </label>
          <input
            type="email"
            className="mt-1 block w-full border border-borderdelete rounded-xl shadow-sm p-2"
            placeholder="New email"
          />
        </div>
        <div className="mt-4">
          <label className="block text-lg font-poppins font-medium text-borderdelete">
            Confirm new email
          </label>
          <input
            type="email"
            className="mt-1 block w-full border font-poppins border-borderdelete rounded-xl shadow-sm p-2"
            placeholder="Confirm new email"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setChangeEmailOpen(false)}
            className="px-4 py-2 border border-black rounded-3xl w-[154px]"
          >
            Cancel
          </button>
          <button className="px-4 w-[180px] py-2 bg-black text-white rounded-3xl">
            Change email
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change password"
        isOpen={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      >
        <div className="mt-4">
          <label className="block text-lg font-inter font-medium text-borderdelete">
            New password
          </label>
          <input
            type="password"
            className="mt-2 block w-full border border-borderdelete rounded-xl shadow-sm p-2"
            placeholder="New password"
          />
          <p className="text-sm text-borderdelete mt-2">
            Use 6 or more characters with a mix of uppercase and lowercase
            letters, and numbers.
          </p>
        </div>
        <div className="mt-4">
          <label className="block text-lg font-inter font-medium text-borderdelete">
            Confirm new password
          </label>
          <input
            type="password"
            className="mt-2 block w-full border border-borderdelete rounded-xl shadow-sm p-2"
            placeholder="Confirm new password"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setChangePasswordOpen(false)}
            className="px-4 py-2 border border-black rounded-3xl w-[154px]"
          >
            Cancel
          </button>
          <button className="px-4 w-[180px] py-2 bg-black text-white rounded-3xl">
            Change password
          </button>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        title="Delete Account"
        isOpen={isDeleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      >
        <p className="text-sm  text-chat font-poppins mt-8">
          All workspace that you own will be{' '}
          <span className="font-semibold">permanently deleted</span>. You will
          also be removed from any other workspace where you hold the roles of
          admin, member, or guest.
        </p>

        <div className="mt-8 flex items-center">
          <input
            id="confirmDeletion"
            type="checkbox"
            checked={confirmDeletion}
            onChange={() => setConfirmDeletion(!confirmDeletion)}
            className="w-4 h-4 text-red-600 bg-red-100 border-red-600 rounded focus:ring-red-500 checked:bg-red-600 checked:border-red-600"
          />

          <label
            htmlFor="confirmDeletion"
            className="ml-2 block font-poppins text-sm text-delete2"
          >
            I understand that this cannot be undone. All workspace data will be
            gone forever.
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setDeleteAccountOpen(false)}
            className="px-4 py-2 border border-black rounded-3xl w-[154px]"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={!confirmDeletion}
            className={`px-4 w-[180px] py-2 rounded-3xl text-white ${
              confirmDeletion ? 'bg-delete2' : 'bg-red-300'
            }`}
          >
            Delete Account
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserSettingsPage;
