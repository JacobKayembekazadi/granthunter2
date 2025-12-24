import React, { useState } from 'react';
import Dashboard from './src/pages/Dashboard';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <Dashboard />
      <Toaster position="top-right" theme="dark" />
    </div>
  );
};

export default App;