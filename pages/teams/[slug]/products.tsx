import React, { useState, useRef, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPageWithLayout } from '../../../types';
import { useTranslation } from 'next-i18next';
import Section from '../../../components/mytask/section';
import TaskDetailModal from '../../../components/mytask/taskdetailmodal';
import {
  Section as SectionType,
  TaskType as ComponentTaskType,
} from '../../../components/mytask/type';
import { TaskType as IndexTaskType } from '../../../types/index';
import { HiChevronUp, HiChevronDown, HiCheck, HiPlus } from 'react-icons/hi';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useViewMode } from '../../../context/viewmodecontext';
import ListViewSection from '@/components/mytask/listviewsection';
import { convertTaskToComponentType } from '../../../utility/taskconversion';

const currentUserId = 'currentUserId';

const initialSections: SectionType[] = [
  { id: 1, title: 'Overdue', tasks: [] },
  { id: 2, title: 'Today', tasks: [] },
  { id: 3, title: 'Tomorrow', tasks: [] },
  { id: 4, title: 'No Due Date', tasks: [] },
];

const Products: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const [sections, setSections] = useState<SectionType[]>(initialSections);
  const [filter, setFilter] = useState<'assignedByMe' | 'assignedToMe' | 'all'>(
    'all'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ComponentTaskType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { viewMode } = useViewMode();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterTasks = (tasks: ComponentTaskType[]) => {
    return tasks.filter((task) => {
      if (filter === 'assignedByMe') {
        return task.assignor === currentUserId;
      } else if (filter === 'assignedToMe') {
        return task.assignee === currentUserId;
      }
      return true;
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceSectionIndex = sections.findIndex(
      (section) => section.id === parseInt(source.droppableId)
    );
    const destinationSectionIndex = sections.findIndex(
      (section) => section.id === parseInt(destination.droppableId)
    );

    const sourceTasks = Array.from(sections[sourceSectionIndex].tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    const destinationTasks = Array.from(
      sections[destinationSectionIndex].tasks
    );

    destinationTasks.splice(destination.index, 0, movedTask);

    const newSections = [...sections];
    newSections[sourceSectionIndex] = {
      ...sections[sourceSectionIndex],
      tasks: sourceTasks,
    };
    newSections[destinationSectionIndex] = {
      ...sections[destinationSectionIndex],
      tasks: destinationTasks,
    };

    setSections(newSections);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectFilter = (value: 'assignedByMe' | 'assignedToMe' | 'all') => {
    setFilter(value);
    setIsDropdownOpen(false);
  };

  const openModal = (task: IndexTaskType) => {
    const convertedTask = convertTaskToComponentType(task);
    setSelectedTask(convertedTask);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const addTask = (sectionId: number) => {
    const newTask: IndexTaskType = {
      id: Date.now().toString(),
      name: 'New Task Name',
      description: 'Detailed description of the task',
      dueDate: new Date(),
      priority: 'High', // Ensure this matches 'Low' | 'Medium' | 'High'
      assignor: 'assignor-id',
      assignee: 'assignee-id',
      assigneeAvatar: '/moon.png',
      status: false,
      tag: 'General',
      teamId: 'team-id',
      projectId: 'project-id',
      stage: 'In Progress',
    };
    const convertedTask = convertTaskToComponentType(newTask);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, tasks: [...section.tasks, convertedTask] }
          : section
      )
    );
  };

  const updateTask = (updatedTask: IndexTaskType) => {
    const convertedTask = convertTaskToComponentType(updatedTask);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.tasks.some((task) => task.id === convertedTask.id)
          ? {
              ...section,
              tasks: section.tasks.map((task) =>
                task.id === convertedTask.id ? convertedTask : task
              ),
            }
          : section
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        tasks: section.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const duplicateTask = (task: IndexTaskType) => {
    const convertedTask = convertTaskToComponentType(task);
    const newTask = { ...convertedTask, id: Date.now().toString() };
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.tasks.some((t) => t.id === convertedTask.id)
          ? { ...section, tasks: [...section.tasks, newTask] }
          : section
      )
    );
  };

  const addSection = () => {
    const newSection: SectionType = {
      id: sections.length + 1,
      title: `New Section ${sections.length + 1}`,
      tasks: [],
    };
    setSections([...sections, newSection]);
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
          <ListViewSection
            section={{ ...section, tasks: filterTasks(section.tasks) }}
            updateTask={updateTask}
            deleteTask={deleteTask}
            duplicateTask={duplicateTask}
            onCardClick={openModal}
            addTask={() => addTask(section.id)}
            color={sectionColor} // Pass the color to the ListViewSection
          />
        </div>
      );
    }

    return (
      <div key={section.id} className="min-w-max">
        <Section
          section={{ ...section, tasks: filterTasks(section.tasks) }}
          addTask={() => addTask(section.id)}
          updateTask={updateTask}
          deleteTask={deleteTask}
          duplicateTask={duplicateTask}
          color={sectionColor} // Pass the color to the Section component
          onCardClick={openModal}
          renameSection={renameSection}
          deleteSection={deleteSection}
        />
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-5 bg-white h-screen rounded-3xl overflow-x-auto ">
        <div
          className="flex justify-between items-center mb-4 bg-white relative"
          ref={dropdownRef}
        >
          <button
            onClick={toggleDropdown}
            className="w-[245px] text-left bg-white text-black custom-18 p-2 rounded-md focus:outline-none flex items-center justify-between"
          >
            <span className="flex items-center">
              {filter === 'assignedByMe'
                ? t('Tasks Assigned by Me')
                : filter === 'assignedToMe'
                  ? t('Tasks Assigned to Me')
                  : t('All Tasks')}
              {isDropdownOpen ? (
                <HiChevronUp className="w-6 h-6 text-gray-700 ml-2" />
              ) : (
                <HiChevronDown className="w-6 h-6 text-gray-700 ml-2" />
              )}
            </span>
          </button>

          {isDropdownOpen && (
            <ul className="absolute z-10 mt-1 w-[245px] top-10 left-4 bg-white border border-gray-300 p-4 rounded-2xl shadow-2xl">
              <li
                onClick={() => selectFilter('all')}
                className={`px-2 py-1 cursor-pointer hover:bg-chatbg flex items-center justify-between ${
                  filter === 'all' ? 'text-black' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  {t('All Tasks')}
                  {filter === 'all' && (
                    <HiCheck className="w-[18px] h-[18px] ml-4" />
                  )}
                </span>
              </li>
              <li
                onClick={() => selectFilter('assignedByMe')}
                className={`px-2 py-1 cursor-pointer hover:bg-chatbg flex items-center justify-between ${
                  filter === 'assignedByMe' ? 'text-black' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  {t('Tasks Assigned by Me')}
                  {filter === 'assignedByMe' && (
                    <HiCheck className="w-[18px] h-[18px] ml-4" />
                  )}
                </span>
              </li>
              <li
                onClick={() => selectFilter('assignedToMe')}
                className={`px-2 py-1 cursor-pointer hover:bg-chatbg flex items-center justify-between ${
                  filter === 'assignedToMe' ? 'text-black' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center">
                  {t('Tasks Assigned to Me')}
                  {filter === 'assignedToMe' && (
                    <HiCheck className="w-[18px] h-[18px] ml-4" />
                  )}
                </span>
              </li>
            </ul>
          )}
        </div>

        <div
          className={`flex ${
            viewMode === 'List' ? 'flex-col space-y-4' : 'space-x-4 min-w-max'
          }`}
        >
          {sections.map(renderSection)}

          <div className="min-w-max flex-shrink-0">
            <button
              onClick={addSection}
              className="text-black font-md p-2 custom-18 whitespace-nowrap flex items-center"
            >
              <HiPlus className="w-6 h-6 mr-2" />
              {t('Add Section')}
            </button>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        updateTask={updateTask}
      />
    </DragDropContext>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});

export default Products;
