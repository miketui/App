import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Video, FileText, X, Globe, Users, Lock, Sparkles, Smile } from 'lucide-react';
import { postAPI, aiAPI } from '../services/api';
import { POST_VISIBILITY } from '../utils/constants';
import { formatFileSize, isImageFile, isVideoFile } from '../utils/helpers';
import toast from 'react-hot-toast';

function PostCreator({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const generateAICaption = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content or media first');
      return;
    }

    setIsGeneratingCaption(true);
    try {
      const mediaType = selectedFiles.length > 0 ? 
        (isImageFile(selectedFiles[0].file) ? 'image' : 'video') : 'text';
      
      const response = await aiAPI.generateCaption(content, mediaType);
      setContent(response.data.caption || response.data);
      toast.success('AI caption generated!');
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error('Failed to generate AI caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      toast.error('Please add some content or media to your post');
      return;
    }

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('visibility', visibility);
      
      selectedFiles.forEach((fileObj, index) => {
        formData.append(`media[${index}]`, fileObj.file);
      });

      const response = await postAPI.create(formData);
      
      // Clean up file previews
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });

      // Reset form
      setContent('');
      setSelectedFiles([]);
      setVisibility('public');
      setShowPreview(false);

      toast.success('Post created successfully!');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'members_only':
        return <Users className="w-4 h-4" />;
      case 'house_only':
        return <Users className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityText = () => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'members_only':
        return 'Members Only';
      case 'house_only':
        return 'House Only';
      case 'private':
        return 'Private';
      default:
        return 'Public';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">U</span>
        </div>

        {/* Post Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* Text Input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the ballroom community?"
              className="w-full border-0 resize-none focus:ring-0 text-gray-900 placeholder-gray-500"
              rows={3}
              maxLength={1000}
            />

            {/* Media Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedFiles.map((fileObj) => (
                    <div key={fileObj.id} className="relative group">
                      {isImageFile(fileObj.file) ? (
                        <img
                          src={fileObj.preview}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={fileObj.preview}
                          className="w-full h-24 object-cover rounded-lg"
                          muted
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(fileObj.id)}
                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Character Count */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{content.length}/1000</span>
              <div className="flex items-center space-x-2">
                {content.length > 800 && (
                  <span className="text-orange-500">
                    {1000 - content.length} characters left
                  </span>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                {/* Media Upload */}
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Add media"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>

                {/* AI Caption Generator */}
                <button
                  type="button"
                  onClick={generateAICaption}
                  disabled={isGeneratingCaption || (!content.trim() && selectedFiles.length === 0)}
                  className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate AI caption"
                >
                  {isGeneratingCaption ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </button>

                {/* Emoji Picker */}
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {/* Visibility Selector */}
                <div className="relative">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {Object.entries(POST_VISIBILITY).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {getVisibilityIcon()}
                  </div>
                </div>

                {/* Post Button */}
                <button
                  type="submit"
                  disabled={isPosting || (!content.trim() && selectedFiles.length === 0)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isPosting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </div>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Media Upload Drop Zone */}
      {isDragActive && (
        <div className="mt-4 p-4 border-2 border-dashed border-purple-500 bg-purple-50 rounded-lg text-center">
          <p className="text-purple-600 font-medium">Drop your media files here</p>
        </div>
      )}
    </div>
  );
}

export default PostCreator;