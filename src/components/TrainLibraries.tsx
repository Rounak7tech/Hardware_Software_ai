import React, { useState } from 'react';
import { Upload, FileText, Image, FileCode, Trash2, Eye, Download } from 'lucide-react';

interface TrainLibrariesProps {
  isDarkMode: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'image' | 'code';
  size: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  preview?: {
    deviceName: string;
    deviceImage: string;
    codeSnippet: string;
    pinDiagram: string;
  };
}

const TrainLibraries: React.FC<TrainLibrariesProps> = ({ isDarkMode }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'ESP32_Datasheet.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: new Date(),
      status: 'completed',
      preview: {
        deviceName: 'ESP32 DevKit V1',
        deviceImage: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
        codeSnippet: '#include <WiFi.h>\n#include <WebServer.h>\n\nWebServer server(80);',
        pinDiagram: 'GPIO pins 0-39 available for I/O operations'
      }
    },
    {
      id: '2',
      name: 'sensor_documentation.txt',
      type: 'text',
      size: '156 KB',
      uploadDate: new Date(),
      status: 'processing',
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileType = getFileType(file.name);
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        status: 'processing',
      };
      
      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate processing
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'completed', preview: generatePreview(f) }
              : f
          )
        );
      }, 3000);
    });
  };

  const getFileType = (filename: string): UploadedFile['type'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['txt', 'md', 'doc', 'docx'].includes(extension || '')) return 'text';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    if (['c', 'cpp', 'ino', 'py', 'js'].includes(extension || '')) return 'code';
    return 'text';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const generatePreview = (file: UploadedFile) => ({
    deviceName: `Hardware Component from ${file.name}`,
    deviceImage: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
    codeSnippet: `// Generated from ${file.name}\n// Hardware initialization code`,
    pinDiagram: 'Auto-generated pin configuration'
  });

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500" size={20} />;
      case 'image':
        return <Image className="text-blue-500" size={20} />;
      case 'code':
        return <FileCode className="text-green-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return isDarkMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-600 bg-emerald-50';
      case 'processing':
        return isDarkMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50';
      default:
        return isDarkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className={`p-6 border-b ${
        isDarkMode 
          ? 'bg-slate-800/90 border-slate-700/50' 
          : 'bg-white/90 border-gray-200/50'
      } backdrop-blur-xl`}>
        <h2 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Train Libraries / RAG Training
        </h2>
        <p className={`${
          isDarkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Upload documentation, PDFs, images, and code files to train the AI on new hardware components
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Main Upload Area */}
        <div className="flex-1 p-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 mb-6 transition-all ${
              isDragOver
                ? isDarkMode 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-emerald-500 bg-emerald-50'
                : isDarkMode 
                ? 'border-slate-600 hover:border-slate-500 bg-slate-800/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <div className="text-center">
              <Upload size={48} className={`mx-auto mb-4 ${
                isDragOver 
                  ? 'text-emerald-500' 
                  : isDarkMode ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Drag & drop files here
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Support for PDFs, images, text files, and code documentation
              </p>
              <label className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer">
                Browse Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* Uploaded Files Library */}
          <div className={`rounded-2xl ${
            isDarkMode 
              ? 'bg-slate-800/90 border border-slate-700/50' 
              : 'bg-white/90 border border-gray-200/50'
          } backdrop-blur-xl shadow-xl`}>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Document Library
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`rounded-xl p-4 transition-all cursor-pointer ${
                      selectedFile?.id === file.id
                        ? isDarkMode 
                          ? 'bg-emerald-500/20 border border-emerald-500/50' 
                          : 'bg-emerald-50 border border-emerald-200'
                        : isDarkMode 
                        ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <h4 className={`font-medium text-sm ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {file.name}
                          </h4>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-600'
                          }`}>
                            {file.size} • {file.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id));
                        }}
                        className="text-red-500 hover:bg-red-500/20 p-1 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                        getStatusColor(file.status)
                      }`}>
                        {file.status}
                      </span>
                      {file.status === 'completed' && (
                        <button className={`text-xs ${
                          isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                        }`}>
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Preview Panel */}
        {selectedFile?.preview && (
          <div className={`w-96 border-l ${
            isDarkMode 
              ? 'bg-slate-800/90 border-slate-700/50' 
              : 'bg-white/90 border-gray-200/50'
          } backdrop-blur-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Hardware Preview
              </h3>
              <button className={`px-3 py-1 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}>
                <Download size={16} />
              </button>
            </div>

            {/* Device Card */}
            <div className={`rounded-xl p-4 mb-4 ${
              isDarkMode ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-100 border border-gray-200'
            }`}>
              <img
                src={selectedFile.preview.deviceImage}
                alt={selectedFile.preview.deviceName}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedFile.preview.deviceName}
              </h4>
            </div>

            {/* Generated Code */}
            <div className={`rounded-lg mb-4 ${
              isDarkMode ? 'bg-slate-900' : 'bg-gray-900'
            } p-4`}>
              <h4 className="text-emerald-400 font-medium text-sm mb-2">Auto-Generated Code</h4>
              <pre className="text-green-400 text-xs font-mono overflow-auto">
                {selectedFile.preview.codeSnippet}
              </pre>
            </div>

            {/* Pin Diagram */}
            <div className={`rounded-lg p-4 ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}>
              <h4 className={`font-semibold text-sm mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Pin Configuration
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {selectedFile.preview.pinDiagram}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainLibraries;