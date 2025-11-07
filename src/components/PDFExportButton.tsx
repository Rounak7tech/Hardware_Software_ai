import React from 'react';
import { Download } from 'lucide-react';
import { exportProjectToPDF, exportProjectDocumentation, ProjectData } from '../utils/pdfExport';

interface PDFExportButtonProps {
  projectData: ProjectData;
  elementId?: string;
  isDarkMode: boolean;
  variant?: 'full' | 'element' | 'documentation';
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  projectData,
  elementId,
  isDarkMode,
  variant = 'documentation',
  className = ''
}) => {
  const handleExport = async () => {
    try {
      switch (variant) {
        case 'element':
          if (!elementId) {
            throw new Error('Element ID is required for element export');
          }
          await exportProjectToPDF(elementId, projectData);
          break;
        case 'documentation':
          await exportProjectDocumentation(projectData);
          break;
        case 'full':
        default:
          await exportProjectToPDF(elementId || 'project-content', projectData);
          break;
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
        ${isDarkMode 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }
        ${className}
      `}
    >
      <Download size={16} />
      <span>Export PDF</span>
    </button>
  );
};

export default PDFExportButton;

