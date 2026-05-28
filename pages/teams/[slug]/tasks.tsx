import React, { useState, useRef, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPageWithLayout } from '../../../types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import TaskSection from '../../../components/tasks/TaskSection';
import TaskDetailModal from '../../../components/tasks/TaskDetailModal';
import {
  Section as SectionType,
  TaskType as ComponentTaskType,
} from '../../../components/tasks/types';
import { TaskType as IndexTaskType } from '../../../types/index';
import { HiChevronUp, HiChevronDown, HiCheck, HiPlus } from 'react-icons/hi';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useViewMode } from '../../../context/viewmodecontext';
import TaskListViewSection from '@/components/tasks/TaskListViewSection';
import { convertTaskToComponentType } from '../../../utility/taskconversion';

const currentUserId = 'currentUserId';

const initialSections: SectionType[] = [
  { id: 1, title: 'Overdue', tasks: [] },
  { id: 2, title: 'Today', tasks: [] },
  { id: 3, title: 'Tomorrow', tasks: [] },
  { id: 4, title: 'No Due Date', tasks: [] },
];

const groupTasksIntoSections = (allTasks: IndexTaskType[], teamId: string): SectionType[] => {
  const teamTasks = allTasks.filter((task) => task.teamId === teamId);

  const overdueTasks: IndexTaskType[] = [];
  const todayTasks: IndexTaskType[] = [];
  const tomorrowTasks: IndexTaskType[] = [];
  const noDueDateTasks: IndexTaskType[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  teamTasks.forEach((task) => {
    if (!task.dueDate) {
      noDueDateTasks.push(task);
      return;
    }

    const taskDate = new Date(task.dueDate);
    const taskDateNormalized = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    if (taskDateNormalized.getTime() < todayStart.getTime()) {
      if (!task.status) {
        overdueTasks.push(task);
      } else {
        noDueDateTasks.push(task);
      }
    } else if (taskDateNormalized.getTime() === todayStart.getTime()) {
      todayTasks.push(task);
    } else if (taskDateNormalized.getTime() === tomorrowStart.getTime()) {
      tomorrowTasks.push(task);
    } else {
      noDueDateTasks.push(task);
    }
  });

  return [
    { id: 1, title: 'Overdue', tasks: overdueTasks.map(convertTaskToComponentType) },
    { id: 2, title: 'Today', tasks: todayTasks.map(convertTaskToComponentType) },
    { id: 3, title: 'Tomorrow', tasks: tomorrowTasks.map(convertTaskToComponentType) },
    { id: 4, title: 'No Due Date', tasks: noDueDateTasks.map(convertTaskToComponentType) },
  ];
};

const Tasks: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';

  const { t } = useTranslation('common');
  const [sections, setSections] = useState<SectionType[]>(initialSections);
  const [tasks, setTasks] = useState<IndexTaskType[]>([]);
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

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/task');
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (teamId) {
      const grouped = groupTasksIntoSections(tasks, teamId);
      setSections(grouped);
    }
  }, [tasks, teamId]);

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

    let newDueDate: Date | null = originalTask.dueDate;
    if (destinationSectionId === 1) {
      newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() - 1);
    } else if (destinationSectionId === 2) {
      newDueDate = new Date();
    } else if (destinationSectionId === 3) {
      newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 1);
    } else if (destinationSectionId === 4) {
      newDueDate = null;
    }

    const updatedTask: IndexTaskType = {
      ...originalTask,
      dueDate: newDueDate,
      stage: destinationSectionId === 1 ? 'Overdue' : destinationSectionId === 2 ? 'Today' : destinationSectionId === 3 ? 'Tomorrow' : 'No Due Date',
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

  const addTask = async (sectionId: number) => {
    try {
      let defaultDueDate: Date | null = null;
      if (sectionId === 1) {
        defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() - 1);
      } else if (sectionId === 2) {
        defaultDueDate = new Date();
      } else if (sectionId === 3) {
        defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 1);
      }

      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Task',
          description: 'Detailed description of the task',
          dueDate: defaultDueDate,
          priority: 'High',
          teamId,
          projectId: '',
          stage: sectionId === 1 ? 'Overdue' : sectionId === 2 ? 'Today' : sectionId === 3 ? 'Tomorrow' : 'No Due Date',
          status: false,
          tag: 'General',
        }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks((prev) => [...prev, responseData.data]);
      } else {
        alert(responseData.error?.message || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask: IndexTaskType) => {
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
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? responseData.data : t))
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
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        const responseData = await response.json();
        console.error(responseData.error?.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const duplicateTask = async (taskToDuplicate: IndexTaskType) => {
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
        }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.data) {
        setTasks((prev) => [...prev, responseData.data]);
      } else {
        alert(responseData.error?.message || 'Failed to duplicate task');
      }
    } catch (error) {
      console.error('Error duplicating task:', error);
    }
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
          <TaskListViewSection
            section={{ ...section, tasks: filterTasks(section.tasks) }}
            updateTask={updateTask}
            deleteTask={deleteTask}
            duplicateTask={duplicateTask}
            onCardClick={openModal}
            addTask={() => addTask(section.id)}
            color={sectionColor} // Pass the color to the TaskListViewSection
          />
        </div>
      );
    }

    return (
      <div key={section.id} className="min-w-max">
        <TaskSection
          section={{ ...section, tasks: filterTasks(section.tasks) }}
          addTask={() => addTask(section.id)}
          updateTask={updateTask}
          deleteTask={deleteTask}
          duplicateTask={duplicateTask}
          color={sectionColor} // Pass the color to the TaskSection component
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

export default Tasks;
