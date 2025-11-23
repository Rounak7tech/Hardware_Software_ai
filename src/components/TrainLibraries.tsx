import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, Trash2, Eye, Brain, Loader2,
  Send, X, Minimize2, Maximize2, Circle
} from 'lucide-react';

interface TrainLibrariesProps {
  isDarkMode: boolean;
}

type TrainingStatus = 'idle' | 'training' | 'completed' | 'error';

interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'image' | 'code';
  size: string;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  trainingStatus: TrainingStatus;
  preview?: {
    deviceName: string;
    deviceImage: string;
    codeSnippet: string;
    pinDiagram: string;
  };
}

const API_BASE_URL = 'http://localhost:8000';

const TrainLibraries: React.FC<TrainLibrariesProps> = ({ isDarkMode }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [overallTrainingStatus, setOverallTrainingStatus] = useState<TrainingStatus>('idle');
  const [trainingProgress, setTrainingProgress] = useState({ current: 0, total: 0 });
  const [currentTrainingId, setCurrentTrainingId] = useState<string | null>(null);

  // Chat state
  const [showTriyugAI, setShowTriyugAI] = useState(false);
  const [isTriyugMinimized, setIsTriyugMinimized] = useState(false);
  const [triyugMessages, setTriyugMessages] = useState<Array<{ id: string; type: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [triyugInput, setTriyugInput] = useState('');
  const [isTriyugLoading, setIsTriyugLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTriyugAI && triyugMessages.length === 0) {
      setTriyugMessages([{
        id: '1',
        type: 'assistant',
        content: "Hello! I'm Triyug AI, your hardware documentation assistant. I've been trained on your uploaded documents and I'm ready to help you with questions about hardware components, pin configurations, code examples, and project guidance. How can I assist you today?",
        timestamp: new Date(),
      }]);
    }
  }, [showTriyugAI]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [triyugMessages]);

  // ----------- UPDATED FILE UPLOAD, ACTUAL API CALL -----------
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      // Display as uploading
      const fileType = getFileType(file.name);
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        status: 'uploading',
        trainingStatus: 'idle'
      };
      setUploadedFiles(prev => [...prev, newFile]);

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'completed', preview: generatePreview(f) }
                : f
            )
          );
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'failed' }
              : f
          )
        );
      }
    }
  };
  // ------------------------------------------------------------

  const handleTrainAll = async () => {
    const documentsToTrain = uploadedFiles.filter(
      f => f.status === 'completed' && f.trainingStatus !== 'completed'
    );
    if (documentsToTrain.length === 0) return;
    setOverallTrainingStatus('training');
    setTrainingProgress({ current: 0, total: documentsToTrain.length });
    setUploadedFiles(prev =>
      prev.map(f =>
        documentsToTrain.some(d => d.id === f.id)
          ? { ...f, trainingStatus: 'training' as TrainingStatus }
          : f
      )
    );
    try {
      // Backend only needs to know to re-index, no files; files already exist server-side
      const response = await fetch(`${API_BASE_URL}/api/train`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const trainingId = data.trainingId;
        setCurrentTrainingId(trainingId);
        pollTrainingStatus(trainingId, documentsToTrain);
      } else {
        throw new Error(data.error || 'Training failed');
      }
    } catch (error) {
      setOverallTrainingStatus('error');
      setUploadedFiles(prev =>
        prev.map(f =>
          documentsToTrain.some(d => d.id === f.id)
            ? { ...f, trainingStatus: 'error' as TrainingStatus }
            : f
        )
      );
    }
  };

  const pollTrainingStatus = async (trainingId: string, documentsToTrain: UploadedFile[]) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/train/status/${trainingId}`);
        const data = await response.json();
        if (data.success) {
          setTrainingProgress({
            current: data.completed || 0,
            total: data.total || documentsToTrain.length
          });
          if (data.documents && data.documents.length > 0) {
            setUploadedFiles(prev =>
              prev.map(f => {
                const docStatus = data.documents.find((d: any) => d.name === f.name);
                if (docStatus) {
                  return {
                    ...f,
                    trainingStatus: docStatus.status === 'completed'
                      ? 'completed' as TrainingStatus
                      : docStatus.status === 'error'
                        ? 'error' as TrainingStatus
                        : 'training' as TrainingStatus
                  };
                }
                return f;
              })
            );
          }
          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setOverallTrainingStatus('completed');
            setUploadedFiles(prev =>
              prev.map(f => ({ ...f, trainingStatus: 'completed' as TrainingStatus }))
            );
            setShowTriyugAI(true);
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            setOverallTrainingStatus('error');
            setUploadedFiles(prev =>
              prev.map(f => ({ ...f, trainingStatus: 'error' as TrainingStatus }))
            );
          }
        }
      } catch (error) {
        clearInterval(pollInterval);
        setOverallTrainingStatus('error');
        setUploadedFiles(prev =>
          prev.map(f => ({ ...f, trainingStatus: 'error' as TrainingStatus }))
        );
      }
    }, 2000);
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  const handleTriyugSend = async () => {
    if (!triyugInput.trim() || isTriyugLoading) return;
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: triyugInput,
      timestamp: new Date(),
    };
    setTriyugMessages(prev => [...prev, userMessage]);
    const messageToSend = triyugInput;
    setTriyugInput('');
    setIsTriyugLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageToSend,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: data.response,
          timestamp: new Date(),
        };
        setTriyugMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setTriyugMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTriyugLoading(false);
    }
  };

  const handleTriyugKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTriyugSend();
    }
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

  // --- Everything below is the UI, unchanged ---
  // Use the previously given return ( ... ) block.
return (
  <div className={`h-screen flex flex-col transition-all duration-300 ${showTriyugAI && !isTriyugMinimized ? 'mr-96' : ''}`}>
    {/* Header */}
    <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-gray-200/50'} backdrop-blur-xl`}>
      <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Train Libraries / RAG Training
      </h2>
      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
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
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileUpload(e.dataTransfer.files); }}
        >
          <div className="text-center">
            <Upload size={48} className={`mx-auto mb-4 ${isDragOver ? 'text-emerald-500' : isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Drag & drop files here
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Support for PDFs, images, text files, and code documentation
            </p>
            <label className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer">
              Browse Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={e => handleFileUpload(e.target.files)}
              />
            </label>
          </div>
        </div>
        {/* Uploaded Files Library */}
        <div className={`rounded-2xl ${isDarkMode ? 'bg-slate-800/90 border border-slate-700/50' : 'bg-white/90 border border-gray-200/50'} backdrop-blur-xl shadow-xl`}>
          <div className="p-6 border-b border-slate-700/50">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Document Library</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.length === 0 && (
                <div className="col-span-full text-center text-slate-400">No uploaded files yet.</div>
              )}
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className={`rounded-xl p-4 cursor-pointer ${
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
                      <FileText className="text-red-500" size={20} />
                      <div>
                        <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{file.size} • {file.uploadDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id)); }}
                      className="text-red-500 hover:bg-red-500/20 p-1 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                      file.status === 'completed'
                        ? isDarkMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-600 bg-emerald-50'
                        : file.status === 'uploading'
                          ? isDarkMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-50'
                          : file.status === 'failed'
                            ? isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50'
                            : isDarkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-50'
                    }`}>
                      {file.status}
                    </span>
                    {file.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        {file.trainingStatus === 'training' && (<Loader2 className="animate-spin text-blue-500" size={12} />)}
                        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                          file.trainingStatus === 'completed'
                            ? isDarkMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-600 bg-emerald-50'
                            : file.trainingStatus === 'training'
                              ? isDarkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-600 bg-blue-50'
                              : file.trainingStatus === 'error'
                                ? isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50'
                                : isDarkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-50'
                        }`}>
                          {file.trainingStatus === 'completed'
                            ? 'Trained'
                            : file.trainingStatus === 'training'
                              ? 'Training...'
                              : file.trainingStatus === 'error'
                                ? 'Error'
                                : 'Not Trained'}
                        </span>
                        <button className={`text-xs ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
                          <Eye size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel: Training Status */}
      <div className={`w-96 border-l ${isDarkMode ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/90 border-gray-200/50'} backdrop-blur-xl flex flex-col`}>
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RAG Training</h3>
          </div>
          <div className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-slate-700/50 border border-slate-600/50' : 'bg-gray-100 border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Status</span>
              <div className="flex items-center space-x-2">
                {overallTrainingStatus === 'training' && (<Loader2 className="animate-spin text-blue-500" size={16} />)}
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                  overallTrainingStatus === 'completed'
                    ? isDarkMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-600 bg-emerald-50'
                    : overallTrainingStatus === 'training'
                      ? isDarkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-600 bg-blue-50'
                      : overallTrainingStatus === 'error'
                        ? isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50'
                        : isDarkMode ? 'text-slate-400 bg-slate-500/20' : 'text-gray-500 bg-gray-100'
                }`}>
                  {overallTrainingStatus === 'completed'
                    ? 'Trained'
                    : overallTrainingStatus === 'training'
                      ? 'Training...'
                      : overallTrainingStatus === 'error'
                        ? 'Error'
                        : 'Not Trained'}
                </span>
              </div>
            </div>
            {overallTrainingStatus === 'training' && trainingProgress.total > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Progress</span>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                    {trainingProgress.current} / {trainingProgress.total}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(trainingProgress.current / trainingProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleTrainAll}
            disabled={overallTrainingStatus === 'training' || uploadedFiles.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
              overallTrainingStatus === 'training' || uploadedFiles.length === 0
                ? isDarkMode
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {overallTrainingStatus === 'training' ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Training in Progress...</span>
              </>
            ) : (
              <>
                <Brain size={18} />
                <span>Train All Documents</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    {/* Triyug AI Chat Panel */}
    {showTriyugAI && (
      <div className={`fixed right-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ${isTriyugMinimized ? 'w-0' : 'w-96'} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-l ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} shadow-2xl`}>
        {!isTriyugMinimized && (
          <>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
                  <Circle className="absolute -top-1 -right-1 w-3 h-3 text-emerald-500 fill-emerald-500" size={12} />
                </div>
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Triyug AI
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" size={8} />
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsTriyugMinimized(true)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={() => setShowTriyugAI(false)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {triyugMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    } shadow-md`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className={`text-xs mt-1 block ${message.type === 'user' ? 'text-blue-100' : isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Input Area */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={triyugInput}
                  onChange={e => setTriyugInput(e.target.value)}
                  onKeyPress={handleTriyugKeyPress}
                  placeholder="Ask about hardware components, pin configurations, code examples..."
                  disabled={isTriyugLoading}
                  className={`flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:opacity-50'
                  }`}
                />
                <button
                  onClick={handleTriyugSend}
                  disabled={!triyugInput.trim() || isTriyugLoading}
                  className={`p-3 rounded-xl transition-colors ${triyugInput.trim() && !isTriyugLoading ? 'bg-blue-600 hover:bg-blue-700 text-white' : isDarkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {isTriyugLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
        {/* Minimized Chat */}
        {isTriyugMinimized && (
          <div className={`h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-l ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setIsTriyugMinimized(false)}
              className={`p-4 rounded-lg transition-all hover:scale-110 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'}`}
              title="Restore Triyug AI"
            >
              <div className="flex flex-col items-center space-y-2">
                <Brain size={24} />
                <Maximize2 size={16} />
              </div>
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

};

export default TrainLibraries;
