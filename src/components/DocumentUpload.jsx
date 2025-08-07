import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Video, File, AlertCircle, CheckCircle } from 'lucide-react';
import { documentAPI } from '../services/api';
import { DOCUMENT_CATEGORIES, DOCUMENT_ACCESS_LEVELS, FILE_LIMITS } from '../utils/constants';
import { formatFileSize, isImageFile, isVideoFile, isDocumentFile } from '../utils/helpers';
import toast from 'react-hot-toast';

function DocumentUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    access_level: 'Member',
    tags: ''
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size
      if (file.size > FILE_LIMITS.MAX_SIZE) {
        toast.error(`File too large. Maximum size is ${formatFileSize(FILE_LIMITS.MAX_SIZE)}`);
        return;
      }

      // Validate file type
      if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Please select a supported file.');
        return;
      }

      setSelectedFile(file);
      // Auto-fill title if empty
      if (!metadata.title) {
        setMetadata(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
        }));
      }
    }
  }, [metadata.title]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!metadata.title.trim()) {
      toast.error('Please enter a title for the document');
      return;
    }

    if (!metadata.category) {
      toast.error('Please select a category');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', metadata.title.trim());
      formData.append('description', metadata.description.trim());
      formData.append('category', metadata.category);
      formData.append('access_level', metadata.access_level);
      formData.append('tags', metadata.tags.trim());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await documentAPI.upload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Document uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setMetadata({
        title: '',
        description: '',
        category: '',
        access_level: 'Member',
        tags: ''
      });
      setUploadProgress(0);

      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const getFileIcon = (file) => {
    if (isImageFile(file)) return <Image className="w-8 h-8 text-blue-500" />;
    if (isVideoFile(file)) return <Video className="w-8 h-8 text-purple-500" />;
    if (isDocumentFile(file)) return <FileText className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Document</h2>

      {/* File Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-purple-500 bg-purple-50'
              : isDragReject
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-purple-600 font-medium">Drop the file here...</p>
          ) : isDragReject ? (
            <p className="text-red-600 font-medium">File type not supported</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium mb-2">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, Images, Videos (max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Upload Progress */}
          {uploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            className="input-field"
            placeholder="Enter document title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            className="input-field"
            rows={3}
            placeholder="Enter document description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={metadata.category}
              onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {DOCUMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Level
            </label>
            <select
              value={metadata.access_level}
              onChange={(e) => setMetadata(prev => ({ ...prev, access_level: e.target.value }))}
              className="input-field"
            >
              {Object.entries(DOCUMENT_ACCESS_LEVELS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={metadata.tags}
            onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
            className="input-field"
            placeholder="Enter tags separated by commas"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas (e.g., ballroom, voguing, tutorial)
          </p>
        </div>
      </div>

      {/* Upload Button */}
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            'Upload Document'
          )}
        </button>
      </div>

      {/* File Requirements */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">File Requirements</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Maximum file size: {formatFileSize(FILE_LIMITS.MAX_SIZE)}</li>
          <li>• Supported formats: PDF, DOC, DOCX, TXT, Images (JPEG, PNG, GIF), Videos (MP4, MOV, AVI)</li>
          <li>• All documents will be reviewed before being made available to members</li>
        </ul>
      </div>
    </div>
  );
}

export default DocumentUpload;