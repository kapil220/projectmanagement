/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect, useRef } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPageWithLayout, Project } from 'types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import axios from 'axios';
import Image from 'next/image';
import PlanningSection from '@/components/task/planningsection';
import ToDoSection from '@/components/task/todosection';
import InProgressSection from '@/components/task/inprogresssection';
import ReviewDoneSection from '@/components/task/reviewdonesection';
import { Section, TaskType } from '@/components/task/types';
import {
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const initialSections: Section[] = [
  { id: 1, title: 'Planning', tasks: [] },
  { id: 2, title: 'To do / Re do', tasks: [] },
  { id: 3, title: 'In Progress', tasks: [] },
  { id: 4, title: 'Review/Done', tasks: [] },
];
const fallbackSection: Section = { id: 0, title: '', tasks: [] };
const initialTasks: TaskType[] = [];

const Task: NextPageWithLayout = () => {
  const router = useRouter();
  const { id, slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';
  const { t } = useTranslation('common');
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks); // Use 'TaskType' here
  const [taskList, setTaskList] = useState<any[]>([]);
  const [taskData, setTaskData] = useState<TaskType>({
    id: '',
    name: '',
    stage: '',
    dueDate: new Date(),
    priority: '',
    teamId,
    projectId: '',
    assignor: '',
    status: true,
    assignee: '',
    description: '',
    tag: '',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // State for controlling dropdown

  const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown

  const FetchTaskList = async () => {
    try {
      const response = await axios.get('/api/task');
      setTaskList(response.data.data);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching task', error);
    }
  };

  const getTasksByStage = (stage: string): TaskType[] => {
    console.log('stage===', stage);
    console.log('tasks===', tasks);
    const filteredTasks = tasks.filter((task) => task.stage === stage);
    console.log(`Tasks for ${stage}:`, filteredTasks);
    return filteredTasks;
  };

  const addTask = async (sectionId: number) => {
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          stage: sections.find((section) => section.id === sectionId)?.title,
        }),
      });
      const responseData = await response.json();
      setTasks((prevTasks) => [...prevTasks, responseData.data]);
      setTaskData({
        id: '',
        name: '',
        stage: '',
        dueDate: new Date(),
        priority: '',
        teamId,
        projectId: '',
        assignor: '',
        status: true,
        assignee: '',
        description: '',
        tag: '',
      });
    } catch (error) {
      console.error('Error saving task', error);
      alert('Failed to Save task');
    }
  };

  /* const updateTask = (updatedTask: Task, sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: section.tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              ),
            }
          : section
      )
    );
  }; */

  /* const deleteTask = (taskId: number, sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: section.tasks.filter((task) => task.id !== taskId),
            }
          : section
      )
    );
  }; */

  /* const duplicateTask = (task: Task, sectionId: number) => {
    const newTask = { ...task, id: Date.now() };
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, tasks: [...section.tasks, newTask] }
          : section
      )
    );
  }; */

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.data);
    } catch (error) {
      console.error('Error fetching project', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
    FetchTaskList();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="p-5 bg-white h-screen rounded-3xl">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() =>
            setActiveDropdown(activeDropdown === 'project' ? null : 'project')
          }
          className="flex items-center ml-6 space-x-2 text-customorange "
        >
          <Image
            src="/orange.png"
            alt="moon"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <p className="text-base font-medium font-inter">
            {project ? project.projectName : 'Loading...'}
          </p>
          <Image
            src="/orange2.png"
            alt="moon"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>

        {activeDropdown === 'project' && (
          <div className="absolute top-full px-1 mt-2 bg-white border rounded-lg shadow-lg py-1 w-72 z-10">
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              {t('Customize modules')}
            </button>
            <hr className="my-1 border-gray-300" />
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <PaintBrushIcon className="h-5 w-5 mr-2" />
              {t('Set color and Icon')}
            </button>
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              {t('List setting')}
            </button>
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <UserIcon className="h-5 w-5 mr-2" />
              {t('People and permissions')}
            </button>
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              {t('Add task via email')}
            </button>
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              {t('Duplicate')}
            </button>
            <button className="text-left px-4 py-2 text-sm text-gray-700 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              {t('Archive list')}
            </button>
            <hr className="my-1 border-gray-300" />
            <button className="text-left px-4 py-2 text-sm text-red-600 flex items-center hover:bg-gray-200 w-full rounded-lg transition-all">
              <TrashIcon className="h-5 w-5 mr-2" />
              {t('Delete list')}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-around p-5 space-x-4">
        <PlanningSection
          section={
            sections.find((section) => section.id === 1) ?? fallbackSection
          }
          tasks={getTasksByStage('Planning')}
          addTask={addTask}
          // updateTask={updateTask}
          // deleteTask={deleteTask}
          // duplicateTask={duplicateTask}
        />
        <ToDoSection
          section={
            sections.find((section) => section.id === 2) ?? fallbackSection
          }
          tasks={getTasksByStage('To do / Re do')}
          addTask={addTask}
          // Uncomment the following props when implemented
          // updateTask={updateTask}
          // deleteTask={deleteTask}
          // duplicateTask={duplicateTask}
        />
        <InProgressSection
          section={
            sections.find((section) => section.id === 3) ?? fallbackSection
          }
          tasks={getTasksByStage('In Progress')}
          addTask={addTask}
          // Uncomment the following props when implemented
          // updateTask={updateTask}
          // deleteTask={deleteTask}
          // duplicateTask={duplicateTask}
        />
        <ReviewDoneSection
          section={
            sections.find((section) => section.id === 4) ?? fallbackSection
          }
          tasks={getTasksByStage('Review/Done')}
          addTask={addTask}
          // Uncomment the following props when implemented
          // updateTask={updateTask}
          // deleteTask={deleteTask}
          // duplicateTask={duplicateTask}
        />
      </div>
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Task;
