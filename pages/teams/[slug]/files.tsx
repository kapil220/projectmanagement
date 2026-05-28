import React, { useState, useEffect, useRef } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface WorkspaceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string; // Not included in list responses — fetched on demand for download
  teamId: string;
  projectId: string | null;
  uploadedBy: string;
  createdAt: string;
}

interface Project {
  id: string;
  projectName: string;
}

const FilesPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;
  const teamId = Array.isArray(slug) ? slug[0] : slug ?? '';
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Images' | 'Documents' | 'Media' | 'Archives'>('All');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchFiles = async () => {
    if (!teamId) return;
    try {
      const response = await axios.get(`/api/files?teamId=${teamId}&projectId=${selectedProjectId}`);
      if (response.data && response.data.data) {
        setFiles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [teamId, selectedProjectId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0 || !teamId || !session?.user) return;

    setUploading(true);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        try {
          const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          const response = await axios.post('/api/files', {
            name: file.name,
            size: file.size,
            type: file.type,
            url: base64Url,
            teamId,
            projectId: selectedProjectId !== 'all' ? selectedProjectId : null,
            uploadedBy: session.user.name || session.user.email || 'User',
          });

          if (response.status === 200 && response.data.data) {
            // Strip url from state (consistent with list-response shape — url fetched on demand)
            const { url: _url, ...fileWithoutUrl } = response.data.data;
            setFiles((prev) => [fileWithoutUrl as WorkspaceFile, ...prev]);
          }
        } catch {
          // Silent — toast already handles UX feedback
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Fetch file url on demand and trigger browser download
  const handleDownload = async (file: WorkspaceFile) => {
    setDownloadingId(file.id);
    try {
      const response = await axios.get(`/api/files?id=${file.id}`);
      const fullFile = response.data.data;
      if (!fullFile?.url) return;
      const link = document.createElement('a');
      link.href = fullFile.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFileDelete = async (id: string) => {
    if (!window.confirm(t('Are you sure you want to delete this file?'))) return;
    try {
      const response = await axios.delete(`/api/files?id=${id}`);
      if (response.status === 200) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
      }
    } catch {
      alert('Failed to delete file. Please try again.');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className="w-10 h-10 text-blue-500" />;
    } else if (type.startsWith('video/') || type.startsWith('audio/')) {
      return <VideoCameraIcon className="w-10 h-10 text-purple-500" />;
    } else if (type.includes('pdf') || type.includes('document') || type.includes('text') || type.includes('sheet') || type.includes('presentation')) {
      return <DocumentTextIcon className="w-10 h-10 text-emerald-500" />;
    }
    return <DocumentIcon className="w-10 h-10 text-gray-500" />;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === 'Images') {
      return file.type.startsWith('image/');
    } else if (selectedFilter === 'Documents') {
      return file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text') || file.type.includes('sheet') || file.type.includes('presentation');
    } else if (selectedFilter === 'Media') {
      return file.type.startsWith('video/') || file.type.startsWith('audio/');
    } else if (selectedFilter === 'Archives') {
      return file.type.includes('zip') || file.type.includes('tar') || file.type.includes('gz') || file.type.includes('rar') || file.type.includes('7z');
    }
    return true;
  });

  return (
    <div className="p-8 bg-white min-h-screen rounded-3xl overflow-y-auto">
      {/* Title & Upload Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-inter tracking-tight">
            {t('Files Manager')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('Store, preview, and share all of your workspace assets safely')}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-950 font-semibold font-inter cursor-pointer transition-all appearance-none shadow-sm"
            >
              <option value="all">📂 {t('All Projects')}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  📁 {project.projectName}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-4 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-5 py-3 bg-customorange hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>{uploading ? t('Uploading...') : t('Upload Files')}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-grow max-w-lg">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('Search files...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400 transition-all font-inter"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['All', 'Images', 'Documents', 'Media', 'Archives'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 text-sm font-semibold rounded-2xl transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
              }`}
            >
              {t(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* File Icon & Extension */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 transition-all">
                    {getFileIcon(file.type)}
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* File Info */}
                <h3 className="font-semibold text-gray-900 text-sm truncate mb-1 pr-2 font-inter" title={file.name}>
                  {file.name}
                </h3>
                <p className="text-xs text-gray-400 font-medium mb-3">
                  {formatBytes(file.size)}
                </p>
              </div>

              {/* Uploader and Action */}
              <div className="border-t border-gray-50 pt-4 mt-2 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t('Uploaded By')}
                  </span>
                  <span className="text-xs text-gray-700 font-semibold truncate max-w-[100px] font-inter">
                    {file.uploadedBy}
                  </span>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id}
                  className="flex items-center justify-center p-2 bg-gray-50 hover:bg-orange-500 text-gray-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  title={`Download ${file.name}`}
                >
                  {downloadingId === file.id ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <DocumentIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 font-inter">
            {t('No files found')}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs text-center font-inter">
            {t('Upload files, pictures, or documents to share them with your team members.')}
          </p>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});

export default FilesPage;
