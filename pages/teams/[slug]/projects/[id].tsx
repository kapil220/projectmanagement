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
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useViewMode } from '../../../../context/viewmodecontext';
import TaskSection from '@/components/tasks/TaskSection';
import TaskListViewSection from '@/components/tasks/TaskListViewSection';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { Section as SectionType, TaskType as ComponentTaskType } from '@/components/tasks/types';
import { TaskType as BoardTask } from 'types';
import { convertTaskToComponentType } from '../../../../utility/taskconversion';
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

const initialSections: SectionType[] = [
  { id: 1, title: 'Planning', tasks: [] },
  { id: 2, title: 'To do / Re do', tasks: [] },
  { id: 3, title: 'In Progress', tasks: [] },
  { id: 4, title: 'Review/Done', tasks: [] },
];

const groupProjectTasksIntoSections = (
  allTasks: BoardTask[],
  projectId: string
): SectionType[] => {
  const projectTasks = allTasks.filter((task) => task.projectId === projectId);

  const planningTasks: BoardTask[] = [];
  const todoTasks: BoardTask[] = [];
  const inProgressTasks: BoardTask[] = [];
  const reviewDoneTasks: BoardTask[] = [];

  projectTasks.forEach((task) => {
    if (task.stage === 'Planning') {
      planningTasks.push(task);
    } else if (task.stage === 'To do / Re do') {
      todoTasks.push(task);
    } else if (task.stage === 'In Progress') {
      inProgressTasks.push(task);
    } else if (task.stage === 'Review/Done') {
      reviewDoneTasks.push(task);
    } else {
      planningTasks.push(task); // fallback
    }
  });

  return [
    { id: 1, title: 'Planning', tasks: planningTasks.map(convertTaskToComponentType) },
    { id: 2, title: 'To do / Re do', tasks: todoTasks.map(convertTaskToComponentType) },
    { id: 3, title: 'In Progress', tasks: inProgressTasks.map(convertTaskToComponentType) },
    { id: 4, title: 'Review/Done', tasks: reviewDoneTasks.map(convertTaskToComponentType) },
  ];
};

const TaskPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id, slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';
  const projectId = Array.isArray(id) ? id[0] : id ?? '';
  const { t } = useTranslation('common');

  const [sections, setSections] = useState<SectionType[]>(initialSections);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ComponentTaskType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { viewMode } = useViewMode();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchTaskList = async () => {
    try {
      const response = await axios.get('/api/task');
      if (response.data && response.data.data) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      if (response.data && response.data.data) {
        setProject(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    fetchTaskList();
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      const grouped = groupProjectTasksIntoSections(tasks, projectId);
      setSections(grouped);
    }
  }, [tasks, projectId]);

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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceSectionId = parseInt(source.droppableId);
    const destinationSectionId = parseInt(destination.droppableId);

    const sourceSection = sections.find((s) => s.id === sourceSectionId);
    if (!sourceSection) return;

    const movedTaskComponent = sourceSection.tasks[source.index];
    if (!movedTaskComponent) return;

    const originalTask = tasks.find((t) => t.id === movedTaskComponent.id);
    if (!originalTask) return;

    const stages = ['Planning', 'To do / Re do', 'In Progress', 'Review/Done'];
    const newStage = stages[destinationSectionId - 1] || 'Planning';

    const updatedTask: BoardTask = {
      ...originalTask,
      stage: newStage,
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    try {
      const response = await fetch('/api/task', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === originalTask.id ? originalTask : t))
        );
        console.error(responseData.error?.message || 'Failed to persist drag drop');
      }
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === originalTask.id ? originalTask : t))
      );
      console.error('Error persisting drag drop:', error);
    }
  };

  const addTask = async (sectionId: number) => {
    try {
      const stages = ['Planning', 'To do / Re do', 'In Progress', 'Review/Done'];
      const defaultStage = stages[sectionId - 1] || 'Planning';

      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Task',
          projectId,
          teamId,
          stage: defaultStage,
          description: 'Detailed description of the task',
          dueDate: new Date(),
          priority: 'High',
          status: true,
          tag: 'General',
        }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks((prevTasks) => [...prevTasks, responseData.data]);
      } else {
        alert(responseData.error?.message || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const updateTask = async (updatedTask: BoardTask) => {
    try {
      const response = await fetch('/api/task', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? responseData.data : task
          )
        );
      } else {
        console.error(responseData.error?.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/task?id=${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        const responseData = await response.json();
        console.error(responseData.error?.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const duplicateTask = async (taskToDuplicate: BoardTask) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...duplicatedFields } = taskToDuplicate;
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...duplicatedFields,
          name: `${taskToDuplicate.name} (Copy)`,
          projectId,
          teamId,
        }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks((prevTasks) => [...prevTasks, responseData.data]);
      } else {
        alert(responseData.error?.message || 'Failed to duplicate task');
      }
    } catch (error) {
      console.error('Error duplicating task:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        router.push(`/teams/${slug}/tasks`);
      } catch (error) {
        console.error('Error deleting project list:', error);
        alert('Failed to delete project list');
      }
    }
  };

  const handleDuplicateProject = async () => {
    if (!project) return;
    try {
      const response = await axios.post('/api/projects', {
        projectName: `${project.projectName} (Copy)`,
        description: project.description,
        teamId,
      });
      if (response.status === 200 && response.data.data) {
        alert('Project list duplicated successfully!');
        router.push(`/teams/${slug}/projects/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Error duplicating project list:', error);
      alert('Failed to duplicate project list');
    }
  };

  const handleRenameProject = async () => {
    if (!project) return;
    const newName = window.prompt("Enter new list name:", project.projectName);
    if (newName && newName.trim() !== "" && newName !== project.projectName) {
      try {
        const response = await axios.put(`/api/projects/${projectId}`, {
          projectName: newName,
          description: project.description,
        });
        if (response.status === 200 && response.data.data) {
          setProject(response.data.data);
          alert('Project list renamed successfully!');
        }
      } catch (error) {
        console.error('Error renaming project list:', error);
        alert('Failed to rename project list');
      }
    }
  };

  const handleArchiveProject = async () => {
    if (!project) return;
    if (window.confirm("Are you sure you want to archive this list?")) {
      try {
        const response = await axios.put(`/api/projects/${projectId}`, {
          projectName: project.projectName,
          description: project.description,
          status: false,
        });
        if (response.status === 200) {
          alert('Project list archived successfully!');
          router.push(`/teams/${slug}/tasks`);
        }
      } catch (error) {
        console.error('Error archiving project list:', error);
        alert('Failed to archive project list');
      }
    }
  };

  const openModal = (task: BoardTask) => {
    const converted = convertTaskToComponentType(task);
    setSelectedTask(converted);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const renameSection = (sectionId: number, newTitle: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      )
    );
  };

  const deleteSection = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.filter((section) => section.id !== sectionId)
    );
  };

  const colors = [
    'border-overdue',
    'border-today',
    'border-today',
    'border-nodue',
  ];

  const renderSection = (section: SectionType, index: number) => {
    const sectionColor = colors[index % colors.length];

    if (viewMode === 'List') {
      return (
        <div key={section.id} className="mb-6">
          <TaskListViewSection
            section={section}
            updateTask={(t) => updateTask(t as BoardTask)}
            deleteTask={deleteTask}
            duplicateTask={(t) => duplicateTask(t as BoardTask)}
            onCardClick={(t) => openModal(t as BoardTask)}
            addTask={() => addTask(section.id)}
            color={sectionColor}
          />
        </div>
      );
    }

    return (
      <div key={section.id} className="min-w-max">
        <TaskSection
          section={section}
          addTask={() => addTask(section.id)}
          updateTask={(t) => updateTask(t as BoardTask)}
          deleteTask={deleteTask}
          duplicateTask={(t) => duplicateTask(t as BoardTask)}
          color={sectionColor}
          onCardClick={(t) => openModal(t as BoardTask)}
          renameSection={renameSection}
          deleteSection={deleteSection}
        />
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-5 bg-white h-screen rounded-3xl overflow-x-auto">
        <div className="relative mb-6" ref={dropdownRef}>
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === 'project' ? null : 'project')
            }
            className="flex items-center ml-6 space-x-2 text-customorange"
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
            <div className="absolute top-full px-1 mt-2 bg-white border rounded-2xl shadow-xl py-2 w-72 z-50 text-black font-inter">
              <button 
                onClick={handleRenameProject}
                className="text-left px-4 py-2.5 text-sm text-gray-700 flex items-center hover:bg-gray-100 w-full rounded-xl transition-all"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-500" />
                {t('Rename list')}
              </button>
              <button 
                onClick={() => router.push(`/teams/${slug}/members`)}
                className="text-left px-4 py-2.5 text-sm text-gray-700 flex items-center hover:bg-gray-100 w-full rounded-xl transition-all"
              >
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                {t('People and permissions')}
              </button>
              <button 
                onClick={handleDuplicateProject}
                className="text-left px-4 py-2.5 text-sm text-gray-700 flex items-center hover:bg-gray-100 w-full rounded-xl transition-all"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-gray-500" />
                {t('Duplicate list')}
              </button>
              <button 
                onClick={handleArchiveProject}
                className="text-left px-4 py-2.5 text-sm text-gray-700 flex items-center hover:bg-gray-100 w-full rounded-xl transition-all"
              >
                <ArchiveBoxIcon className="h-5 w-5 mr-2 text-gray-500" />
                {t('Archive list')}
              </button>
              <hr className="my-1.5 border-gray-200" />
              <button 
                onClick={handleDeleteProject}
                className="text-left px-4 py-2.5 text-sm text-red-600 flex items-center hover:bg-gray-100 w-full rounded-xl transition-all"
              >
                <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
                {t('Delete list')}
              </button>
            </div>
          )}
        </div>

        <div
          className={`flex ${
            viewMode === 'List' ? 'flex-col space-y-4' : 'space-x-4 min-w-max'
          }`}
        >
          {sections.map(renderSection)}
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        updateTask={(t) => updateTask(t as BoardTask)}
      />
    </DragDropContext>
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

export default TaskPage;
