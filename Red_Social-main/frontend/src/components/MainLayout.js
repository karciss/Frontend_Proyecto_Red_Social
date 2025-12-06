import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/globalStyles.css';

const MainLayout = ({ children }) => {
  const [activeModule, setActiveModule] = useState('social');

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
  };

  return (
    <div className="main-layout">
      <Sidebar activeModule={activeModule} onModuleChange={handleModuleChange} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
