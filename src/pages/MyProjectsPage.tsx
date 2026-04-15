import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { ProjectData } from '../types';

/* Карточка проекта */
interface ProjectCardProps {
  project: ProjectData;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ project, onSelect, onDelete }) => (
  <div
    className="flex bg-white relative"
    style={{
      width: 'clamp(444px, 30.833vw, 592px)',
      height: 'clamp(227px, 15.764vw, 303px)',
    }}
  >
    {/* Delete button (upper right corner) */}
    <button 
      onClick={() => onDelete(project.id)}
      className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors shadow-sm z-10"
      title="Удалить проект"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
    
    {/* Картинка-превью */}
    <div
      className="shrink-0 bg-cover bg-center border-t border-l border-b border-black"
      style={{
        width: 'clamp(212px, 14.722vw, 283px)',
        height: '100%',
        background: project?.theme?.previewImage ? `url(${project.theme.previewImage}) center/cover no-repeat` : '#CCCCCC',
      }}
    />

    {/* Инфо */}
    <div
      className="flex flex-col justify-between border border-black"
      style={{
        padding: 'clamp(18px, 1.736vw, 33px) clamp(14px, 1.042vw, 20px)',
        flex: 1,
      }}
    >
      <div className="flex flex-col" style={{ gap: 'clamp(8px, 0.556vw, 11px)' }}>
        {/* Название */}
        <span
          className="font-['Syncopate'] font-normal uppercase line-clamp-2"
          style={{
            fontSize: 'clamp(13px, 0.9vw, 18px)',
            lineHeight: '1.2',
            letterSpacing: '-0.03em',
            color: '#000000',
            marginBottom: 'clamp(10px, 1vw, 18px)',
          }}
        >
          {project?.name || project?.theme?.name || 'Проект'}
        </span>

        {/* Страницы */}
        <span
          className="font-['Inter'] font-normal"
          style={{
            fontSize: 'clamp(13px, 0.903vw, 17px)',
            lineHeight: '1.23',
            color: '#000000',
            marginBottom: 'clamp(3px, 0.208vw, 4px)',
          }}
        >
          {project?.pages?.length || 0} стр. {(project?.pages?.length || 0) >= (project?.theme?.recommendedPages || 0) ? '(Готов)' : ''}
        </span>

        {/* Цена */}
        <span
          className="font-['Syncopate'] font-bold"
          style={{
            fontSize: 'clamp(15px, 1.042vw, 20px)',
            lineHeight: '1',
            letterSpacing: '0',
            color: '#111111',
          }}
        >
          {project?.theme?.price || ''}
        </span>
      </div>

      {/* Кнопки */}
      <div className="flex flex-col" style={{ gap: 'clamp(8px, 0.694vw, 13px)' }}>
        <button
          onClick={() => onSelect(project.id)}
          className="flex items-center justify-center font-['Helvetica'] font-normal text-white bg-black border border-black cursor-pointer hover:opacity-80 transition-opacity text-center w-full"
          style={{
            height: 'clamp(35px, 2.5vw, 45px)',
            fontSize: 'clamp(11px, 0.8vw, 15px)',
            lineHeight: '1',
            letterSpacing: '0',
          }}
        >
          Продолжить сборку
        </button>
      </div>
    </div>
  </div>
);

/* Кнопка "добавить проект" */
const AddProjectButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center rounded-full bg-[#F6F6F6] border border-gray-300 cursor-pointer hover:bg-[#EBEBEB] transition-colors shadow-sm"
    style={{
      width: 'clamp(53px, 3.681vw, 71px)',
      height: 'clamp(53px, 3.681vw, 71px)',
    }}
  >
    <svg
      viewBox="0 0 30 30"
      fill="none"
      style={{
        width: 'clamp(30px, 2.083vw, 40px)',
        height: 'clamp(30px, 2.083vw, 40px)',
      }}
    >
      <line x1="0" y1="15" x2="30" y2="15" stroke="#000000" strokeWidth="2" />
      <line x1="15" y1="0" x2="15" y2="30" stroke="#000000" strokeWidth="2" />
    </svg>
  </button>
);

export interface MyProjectsPageProps {
  projects: ProjectData[];
  onNewProject: () => void;
  onProjectSelect: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const MyProjectsPage: FC<MyProjectsPageProps> = ({ projects, onNewProject, onProjectSelect, onDeleteProject }) => {
  return (
    <div className="landing-page flex flex-col min-h-screen bg-white">
      <Navbar variant="light" />

      {/* spacer for fixed navbar */}
      <div style={{ height: 'clamp(50px, 4.65vw, 89px)' }} />

      {/* Контент */}
      <main
        className="page-container flex-1"
        style={{
          padding: `clamp(50px, 5.139vw, 99px) clamp(24px, 5.347vw, 103px)`,
        }}
      >
        <div className="flex justify-between items-center mb-8" style={{ marginBottom: 'clamp(30px, 4.653vw, 89px)' }}>
            <h1
            className="font-['Syncopate'] font-bold m-0 uppercase"
            style={{
                fontSize: 'clamp(21px, 2.153vw, 41px)',
                lineHeight: '0.9',
                color: '#000000'
            }}
            >
            МОИ ПРОЕКТЫ
            </h1>
        </div>

        {/* Сетка: карточки + кнопка добавления */}
        <div
          className="flex flex-wrap items-center relative"
          style={{ gap: 'clamp(30px, 5.556vw, 107px)', marginBottom: 'clamp(100px, 15vw, 200px)' }}
        >
          {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onSelect={onProjectSelect} 
                  onDelete={onDeleteProject} 
                />
              ))
          ) : (
             <div className="w-full py-10 flex flex-col items-center justify-center opacity-50">
                 <p className="font-['Helvetica'] mb-4 text-center">Вы еще не создали ни одного проекта.<br/>Начните создавать свой первый журнал!</p>
             </div>
          )}
          <AddProjectButton onClick={onNewProject} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyProjectsPage;
