import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.default })));
const MyProjectsPage = lazy(() => import('./pages/MyProjectsPage').then(m => ({ default: m.default })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.default })));
const EditorView = lazy(() => import('./components/EditorView').then(m => ({ default: m.EditorView })));
const MainPage = lazy(() => import('./components/MainPage').then(m => ({ default: m.MainPage })));
import { Icons } from './components/IconComponents';

// New Static Pages
import AboutPage from './pages/AboutPage';
import DesignerServicePage from './pages/DesignerServicePage';

// Hooks
import { useProjects } from './hooks/useProjects';
import { useAuth } from './context/AuthContext';
import { useLayouts } from './hooks/useLayouts';

const ScrollToHash: React.FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

const App: React.FC = () => {
  const projects = useProjects();
  const { role } = useAuth();
  const { layouts: availableLayouts, saveLayout: handleAdminSaveLayout, deleteLayout: handleDeleteLayout } = useLayouts();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center font-bold text-xl uppercase tracking-widest text-[#CCCCCC]">Загрузка...</div>}>
      <ScrollToHash />
      <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/designer-service" element={<DesignerServicePage />} />
      <Route path="/projects" element={
        <MyProjectsPage
          projects={projects.projects}
          onNewProject={() => navigate('/product')}
          onProjectSelect={(id) => navigate(`/editor/${id}`)}
          onDeleteProject={(id) => {
            if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
              projects.deleteProject(id);
            }
          }}
        />
      } />
      <Route path="/product/:id?" element={
        <ProductPage
          onSelectTheme={async (theme) => {
            try {
              const { project } = await projects.startNewProject(theme);
              navigate(`/editor/${project.id}`);
            } catch (e: any) {
              console.error('Failed:', e);
              alert('Ошибка при создании проекта');
            }
          }}
        />
      } />
      <Route path="/editor/:projectId" element={<EditorView />} />
      <Route path="/cart" element={
        <CartPage
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
    </Suspense>
  );
};

export default App;