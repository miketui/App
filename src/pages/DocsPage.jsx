import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, Upload } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

function DocsPage() {
  const { userProfile, canAccess } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  const handleUploadComplete = () => {
    setShowUpload(false);
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
            <p className="text-gray-600 mt-2">
              Access ballroom resources, tutorials, and community documents
            </p>
          </div>
          
          {canAccess('upload_docs') && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary"
            >
              {showUpload ? (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Hide Upload
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && canAccess('upload_docs') && (
        <div className="mb-8">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Document List */}
      <DocumentList key={refreshList} />

      {/* Access Level Info */}
      {userProfile?.role === 'Applicant' && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Limited Access
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                As an applicant, you have access to basic documents. Once your application is approved, 
                you'll have access to the full document library.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocsPage;