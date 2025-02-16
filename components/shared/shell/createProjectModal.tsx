 /* eslint no-use-before-define: 0 */
import React from 'react';
import { useTranslation } from 'next-i18next';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation('common');

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <label>{t('project_name')}</label>
        <input
            className="input"
            name="projectName"
          //  onChange={handleChange}
          />
        <button
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"
          onClick={onClose}
        >
          X
        </button>
  {children}  
      </div>
    </div>
  );
};

export default Modal;