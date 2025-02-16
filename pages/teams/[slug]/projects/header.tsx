import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiSearch, FiMoreHorizontal, FiGrid } from 'react-icons/fi';

function Header() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <button className="flex items-center text-gray-600 hover:text-gray-900">
          <FiFilter className="mr-1" />
          {t('filter')}
        </button>
        <div className="bg-gray-100 px-2 py-1 rounded-full text-blue-600">
          {t('all')}
        </div>
        <button className="text-gray-600 hover:text-gray-900">
          {t('addFilter')}
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <FiMoreHorizontal />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center text-gray-600 hover:text-gray-900">
          <FiSearch />
        </button>
        <button className="flex items-center text-gray-600 hover:text-gray-900">
          <FiGrid />
          <span className="ml-1">{t('view')}</span>
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <FiMoreHorizontal />
        </button>
      </div>
    </div>
  );
}

export default Header;
