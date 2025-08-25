import React, { useEffect, useState } from 'react';


const DevToolsProtection = ({ children }) => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      if ((e.ctrlKey || e.metaKey) && 
          ((e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    const devToolsInterval = setInterval(detectDevTools, 500);

    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers.', 'color: red; font-size: 16px;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      clearInterval(devToolsInterval);
    };
  }, []);

  if (isDevToolsOpen) {
    return (
      <div className="fixed inset-0 bg-red-600 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
          <p className="text-gray-700 mb-4">
            Developer tools have been detected. Please close them to continue using the application.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ userSelect: 'none' }}>
      {children}
    </div>
  );
};

export default DevToolsProtection;