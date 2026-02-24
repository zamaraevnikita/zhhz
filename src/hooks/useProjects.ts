import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, Project, ThemeConfig } from '../types';
import { THEMES } from '../themes';
import { generateId } from '../utils';
import { generateSpreads } from '../services/spreadService';
import { useAuth } from '../context/AuthContext';

export interface UseProjectsReturn {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    projects: Project[];
    activeProjectId: string | null;
    currentTheme: ThemeConfig | null;
    startNewProject: (theme: ThemeConfig) => { project: Project; spreads: ReturnType<typeof generateSpreads> };
    openProject: (project: Project, theme?: ThemeConfig) => { theme: ThemeConfig; spreads: ReturnType<typeof generateSpreads> };
    updateProject: (projectId: string, updates: Partial<Project>) => void;
}

/**
 * Хук для управления проектами, навигацией по экранам и темами.
 */
export function useProjects(): UseProjectsReturn {
    const { currentUser, role } = useAuth();
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);

    // Создание демо-проекта при первом запуске
    useEffect(() => {
        if (projects.length === 0) {
            const demoTheme = THEMES[2];
            const demoProject: Project = {
                id: 'demo-1',
                name: 'Твое Портфолио',
                themeId: demoTheme.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                previewUrl: demoTheme.previewImage,
                spreads: [],
                pageCount: 24,
                price: '2000 ₽',
            };
            setProjects([demoProject]);
        }
    }, []);

    // Загрузка шрифтов темы
    useEffect(() => {
        if (currentTheme) {
            const linkId = 'theme-fonts';
            let link = document.getElementById(linkId) as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            let fontQuery = '';
            if (currentTheme.id === 'lookbook') fontQuery = 'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600';
            if (currentTheme.id === 'valentine') fontQuery = 'family=Great+Vibes&family=Lato:wght@300;400;700';
            if (currentTheme.id === 'astrology') fontQuery = 'family=Cinzel:wght@400;700&family=Montserrat:wght@300;400';
            if (currentTheme.id === 'memories') fontQuery = 'family=Courier+Prime:wght@400;700&family=Merriweather:wght@300;400';
            if (!fontQuery) fontQuery = 'family=Inter:wght@300;400;600';
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
        }
    }, [currentTheme]);

    const startNewProject = useCallback((theme: ThemeConfig) => {
        const newSpreads = generateSpreads();
        const newProject: Project = {
            id: generateId(),
            name: 'Новый проект',
            themeId: theme.id,
            userId: currentUser?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            previewUrl: theme.previewImage,
            spreads: newSpreads,
            pageCount: 20,
            price: theme.price,
        };
        setProjects(prev => [...prev, newProject]);
        setCurrentTheme(theme);
        setActiveProjectId(newProject.id);
        setCurrentView('editor');
        return { project: newProject, spreads: newSpreads };
    }, [currentUser]);

    const openProject = useCallback((project: Project, theme?: ThemeConfig) => {
        const pTheme = theme || THEMES.find(t => t.id === project.themeId) || THEMES[0];
        setCurrentTheme(pTheme);
        setActiveProjectId(project.id);
        setCurrentView('editor');
        const initialSpreads = project.spreads.length > 0 ? project.spreads : generateSpreads();
        return { theme: pTheme, spreads: initialSpreads };
    }, []);

    const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    }, []);

    const visibleProjects = useMemo(() => {
        return projects.filter(p => {
            if (role === 'ADMIN') return true;
            if (role === 'GUEST') return !p.userId;
            return p.userId === currentUser?.id;
        });
    }, [projects, role, currentUser]);

    return {
        currentView,
        setCurrentView,
        projects: visibleProjects,
        activeProjectId,
        currentTheme,
        startNewProject,
        openProject,
        updateProject,
    };
}
