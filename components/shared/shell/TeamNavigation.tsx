/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import UserGroupIcon from '@heroicons/react/20/solid/UserGroupIcon';
import CogIcon from '@heroicons/react/20/solid/CogIcon';

interface TeamNavigationProps {
  activePathname: string | null;
  slug: string;
  isHovered: boolean;
}

const TeamNavigation: React.FC<TeamNavigationProps> = ({
  activePathname,
  slug,
  isHovered,
}) => {
  const { t } = useTranslation();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [projectList, setProjectList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#e57373');
  const [selectedIcon, setSelectedIcon] = useState('🙂');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null); // Ref for modal

  const colors = [
    '#e57373',
    '#f06292',
    '#ba68c8',
    '#9575cd',
    '#7986cb',
    '#64b5f6',
    '#4fc3f7',
    '#4dd0e1',
    '#4db6ac',
    '#81c784',
    '#aed581',
    '#dce775',
    '#fff176',
    '#ffd54f',
    '#ffb74d',
    '#ff8a65',
    '#a1887f',
    '#e0e0e0',
    '#90a4ae',
    '#f44336',
  ];

  const navItems = [
    {
      href: `/teams/${slug}/products`,
      icon: '/task.png',
      activePath: `/teams/${slug}/products`,
      name: t('My task'),
    },
    {
      href: `/teams/${slug}/chats`,
      icon: '/message.png',
      activePath: `/teams/${slug}/chats`,
      name: t('Message'),
    },
  ];

  const fetchAllProject = async () => {
    try {
      const response = await axios.get('/api/projects');
      const newData = response.data.data;
      setProjectList(newData);
    } catch (error) {
      console.error('Error fetching project list', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const deleteProject = async (id: string) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      setProjectList((prev) => prev.filter((project) => project.id !== id));
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !modalRef.current?.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const handleSidebarLeave = (event: React.MouseEvent) => {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen || isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isModalOpen]);

  const updateProject = async () => {
    if (editingProject && newProjectName) {
      try {
        await axios.put(`/api/projects/${editingProject}`, {
          projectName: newProjectName,
          projectDescription: newProjectDescription,
          color: selectedColor,
          icon: selectedIcon,
        });
        setProjectList((prev) =>
          prev.map((project) =>
            project.id === editingProject
              ? {
                  ...project,
                  projectName: newProjectName,
                  projectDescription: newProjectDescription,
                  color: selectedColor,
                  icon: selectedIcon,
                }
              : project
          )
        );
        setEditingProject(null);
        resetModal();
      } catch (error) {
        console.error('Error updating project', error);
      }
    }
  };

  const saveProject = async () => {
    try {
      const response = await axios.post('/api/projects', {
        projectName: newProjectName,
        projectDescription: newProjectDescription,
        color: selectedColor,
        icon: selectedIcon,
      });

      const newProject = response.data.data;
      setProjectList((prev) => [...prev, newProject]);
      resetModal();
    } catch (error) {
      console.error('Error saving project', error);
    }
  };

  const resetModal = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setSelectedColor(colors[0]);
    setSelectedIcon('🙂');
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchAllProject();
  }, []);

  return (
    <div
      className={`flex flex-col space-y-4 bg-dark-gray text-white transition-all duration-300 ${
        isHovered ? 'w-48' : 'w-16'
      }`}
      ref={dropdownRef}
      onMouseLeave={handleSidebarLeave} // Close dropdown when leaving sidebar
    >
      {navItems.map(({ href, icon, activePath, name }) => (
        <a
          key={href}
          href={href}
          className={`flex p-3 transition-all duration-300 ${
            activePathname === activePath
              ? ' text-customorange border-l-2 border-customorange'
              : 'hover:bg-heading'
          } w-full `}
        >
          <Image
            src={icon}
            alt={name}
            width={24}
            height={24}
            className={`w-6 h-6 ${
              activePathname === activePath
                ? 'filter-custom-active'
                : 'filter-custom-default'
            }`}
          />
          {isHovered && (
            <div className="ml-3 whitespace-nowrap">
              <span>{name}</span>
            </div>
          )}
        </a>
      ))}

      <div className="flex items-center p-3 w-full rounded-lg">
        <Image
          src="/Vector.png"
          alt={t('projects')}
          width={24}
          height={24}
          className="w-6 h-6 filter-custom-default"
        />
        {isHovered && (
          <div className="ml-3">
            <span>{t('projects')}</span>
          </div>
        )}
      </div>

      {isHovered && (
        <div>
          <div className="flex items-center p-3 w-full rounded-lg">
            <button
              className="flex items-center"
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            >
              {isProjectsOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
              <span className="ml-2">{t('List')}</span>
            </button>
            <button
              className="ml-auto p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {isProjectsOpen && (
            <div className="flex flex-col mt-2 space-y-1">
              {projectList.map(({ id, projectName }) => (
                <div
                  key={id}
                  className="relative flex items-center p-2 hover:bg-gray-400 rounded-lg"
                >
                  <Image
                    src="/moon.png"
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full filter-custom-default"
                  />
                  <div className="flex-grow ml-2 flex justify-between items-center">
                    <a href={`/teams/${slug}/projects/${id}`} className="mr-2">
                      {projectName}
                    </a>
                    <button
                      className="p-1 text-gray-500 hover:text-gray-300"
                      onClick={() => {
                        console.log('Dropdown clicked!');
                        toggleDropdown();
                      }}
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="relative bg-white rounded-3xl p-6 w-[600px] max-w-md mx-auto shadow-lg text-black"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold mb-4 text-black">
                {t(editingProject ? 'Edit List' : 'Create New List')}
              </h2>
              <button
                onClick={() => resetModal()}
                className="bg-transparent hover:bg-transparent border-none p-0 right-0"
              >
                <img
                  src="/x.png"
                  alt="Close"
                  width={32}
                  height={32}
                  className="h-8 w-8 filter brightness-75 hover:brightness-50"
                />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-borderdelete">
                {t('List color')}
              </label>
              <div className="grid grid-cols-10 gap-2 w-[310px] mt-2 border border-borderdelete p-2">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded ${
                      selectedColor === color ? 'border-2 border-black' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                  ></button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-borderdelete">
                {t('Select icon')}
              </label>
              <button className="mt-2 p-2 border border-borderdelete rounded text-lg">
                {selectedIcon}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-borderdelete">
                {t('Name')}
              </label>
              <input
                name="listName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={t('')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl focus:outline-none text-black bg-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-borderdelete">
                {t('Description (optional)')}
              </label>
              <textarea
                placeholder={t('')}
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-2xl focus:outline-none  text-black bg-white"
              />
            </div>

            <div className="justify-end flex">
              <button
                onClick={editingProject ? updateProject : saveProject}
                className="w-[199px] py-2 bg-black text-white inset-y-0 right-0 rounded-3xl hover:bg-gray-800 "
              >
                {t(editingProject ? 'Update' : 'Create List')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '45%', // Adjust as needed to position dropdown vertically
            left: '50%', // Center the dropdown horizontally
            backgroundColor: 'white',
            zIndex: 999,
            width: '250px', // Adjust width as necessary
            borderRadius: '8px', // Add rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
            border: '1px solid #ddd', // Adjust border color to blend with the design
            color: 'black',
          }}
        >
          <ul className="p-4 space-y-2">
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <PlusIcon className="w-5 h-5 mr-2" />
                Set Color and Icon
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <CogIcon className="w-5 h-5 mr-2" />
                List Setting
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                People and Permissions
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Custom Fields
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Add Tasks via Email
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                Duplicate
              </button>
            </li>
            <li>
              <button className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6">
                <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                Archive List
              </button>
            </li>
            <li>
              <button
                onClick={() => deleteProject('your-project-id')}
                className="flex items-center w-full px-4 py-2 text-sm font-medium font-inter text-black hover:bg-gray-100 leading-6"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete List
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamNavigation;
