import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Tag, FileText, Image, Video, File } from 'lucide-react';
import { documentAPI } from '../services/api';
import { DOCUMENT_CATEGORIES, DOCUMENT_ACCESS_LEVELS } from '../utils/constants';
import { formatFileSize, formatDate, isImageFile, isVideoFile, isDocumentFile } from '../utils/helpers';
import toast from 'react-hot-toast';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        access_level: selectedAccessLevel,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await documentAPI.getAll(params);
      setDocuments(response.data.documents || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, searchTerm, selectedCategory, selectedAccessLevel, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleDownload = async (documentId, documentTitle) => {
    try {
      await documentAPI.download(documentId);
      toast.success(`Download started for "${documentTitle}"`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FileText className="w-6 h-6 text-green-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const getAccessLevelColor = (level) => {
    const colors = {
      'Applicant': 'bg-yellow-100 text-yellow-800',
      'Member': 'bg-blue-100 text-blue-800',
      'Leader': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Rules': 'bg-red-100 text-red-800',
      'History': 'bg-orange-100 text-orange-800',
      'Tutorials': 'bg-green-100 text-green-800',
      'Events': 'bg-blue-100 text-blue-800',
      'Resources': 'bg-purple-100 text-purple-800',
      'House Documents': 'bg-indigo-100 text-indigo-800',
      'Competition Info': 'bg-pink-100 text-pink-800',
      'Media': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by title or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {DOCUMENT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <select
                value={selectedAccessLevel}
                onChange={(e) => setSelectedAccessLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Access Levels</option>
                {Object.entries(DOCUMENT_ACCESS_LEVELS).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="download_count-desc">Most Downloaded</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="btn-primary"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>

            <div className="text-sm text-gray-600">
              {documents.length} document{documents.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </form>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory || selectedAccessLevel
              ? 'Try adjusting your search criteria'
              : 'No documents have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Document Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(doc.file_type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{doc.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Categories and Access Level */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(doc.access_level)}`}>
                    {doc.access_level}
                  </span>
                </div>

                {/* Document Info */}
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(doc.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {doc.download_count || 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {doc.uploader?.display_name || doc.uploader?.first_name || 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {formatFileSize(doc.file_size)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentList;