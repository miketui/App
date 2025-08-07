import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/ChatSidebar';
import ChatThread from '../components/ChatThread';

function ChatPage() {
  const { userProfile } = useAuth();
  const [selectedThread, setSelectedThread] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleNewThread = () => {
    // Handle new thread creation
    console.log('Creating new thread...');
  };

  const handleMessageSent = (message) => {
    // Handle message sent event
    console.log('Message sent:', message);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block`}>
        <ChatSidebar
          selectedThread={selectedThread}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatThread
          thread={selectedThread}
          onMessageSent={handleMessageSent}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;