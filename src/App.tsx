import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeSelection } from './components/ThemeSelection';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { CartView } from './components/CartView';
import { EditorView } from './components/EditorView';
import { Icons } from './components/IconComponents';

// Hooks
import { useProjects } from './hooks/useProjects';
import { useAuth } from './context/AuthContext';
import { useLayouts } from './hooks/useLayouts';

const App: React.FC = () => {
  const projects = useProjects();
  const { role } = useAuth();
  const { layouts: availableLayouts, saveLayout: handleAdminSaveLayout, deleteLayout: handleDeleteLayout } = useLayouts();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={
        <Dashboard
          projects={projects.projects}
          activeProjectId={projects.activeProjectId}
          onNewProject={() => navigate('/theme-selection')}
          onProjectSelect={(id) => navigate(`/editor/${id}`)}
          onDeleteProject={(id) => {
            if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
              projects.deleteProject(id);
            }
          }}
          onViewCart={() => navigate('/cart')}
          onAdminPanel={() => navigate('/admin')}
        />
      } />
      <Route path="/theme-selection" element={
        <ThemeSelection
          onSelectTheme={async (theme) => {
            try {
              const { project } = await projects.startNewProject(theme);
              navigate(`/editor/${project.id}`);
            } catch (e: any) {
              console.error('Failed:', e);
              alert('Ошибка при создании проекта');
            }
          }}
          onBack={() => navigate('/')}
        />
      } />
      <Route path="/editor/:projectId" element={<EditorView />} />
      <Route path="/cart" element={
        <CartView
          projects={projects.projects}
          onBack={() => navigate(-1)}
        />
      } />
      <Route path="/admin" element={
        role === 'ADMIN' ? (
          <AdminPanel
            layouts={availableLayouts}
            onSaveLayout={handleAdminSaveLayout}
            onDeleteLayout={handleDeleteLayout}
            onClose={() => navigate('/')}
          />
        ) : (
          <div className="flex h-screen w-screen items-center justify-center bg-gray-50 flex-col gap-4">
            <Icons.Eye className="text-red-400" size={48} />
            <h2 className="text-xl font-bold text-gray-800">Доступ запрещен</h2>
            <p className="text-gray-500">У вас нет прав администратора для просмотра этой страницы.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Вернуться назад</button>
          </div>
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;