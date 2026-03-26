import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, Project, ThemeConfig } from '../types';
import { THEMES } from '../themes';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { generateSpreads } from '../services/spreadService';

export interface UseProjectsReturn {
    projects: Project[];
    activeProjectId: string | null;
    currentTheme: ThemeConfig | null;
    startNewProject: (theme: ThemeConfig) => Promise<{ project: Project; spreads: ReturnType<typeof generateSpreads> }>;
    openProject: (project: Project, theme?: ThemeConfig) => { theme: ThemeConfig; spreads: ReturnType<typeof generateSpreads> };
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    loadProjectById: (id: string) => Promise<Project>;
}

export function useProjects(): UseProjectsReturn {
    const { currentUser, role } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);

    // Fetch projects from backend. When user logs in, first claim any guest projects.
    useEffect(() => {
        const loadProjects = async () => {
            try {
                // If user just logged in and we have guest projects in state, claim them first
                if (currentUser) {
                    const guestProjectIds = projects
                        .filter(p => !p.userId)
                        .map(p => p.id);

                    if (guestProjectIds.length > 0) {
                        // Silently claim guest projects — errors are non-fatal
                        await fetchApi('/projects/claim', {
                            method: 'PATCH',
                            body: JSON.stringify({ projectIds: guestProjectIds })
                        }).catch(err => console.warn('Failed to claim guest projects:', err));
                    }
                }

                const data = await fetchApi<Project[]>('/projects');
                setProjects(data);
            } catch (err) {
                console.error("Failed to load projects", err);
            }
        };

        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]); // Re-fetch when user logs in/out

    // Fetch a single project by ID if not in list
    const loadProjectById = useCallback(async (id: string) => {
        try {
            const project = await fetchApi<Project>(`/projects/${id}`);
            setProjects(prev => {
                const exists = prev.some(p => p.id === id);
                if (exists) return prev.map(p => p.id === id ? project : p);
                return [...prev, project];
            });
            return project;
        } catch (err) {
            console.error(`Failed to load project ${id}`, err);
            throw err;
        }
    }, []);

    // Theme Font Loading
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
            let fontQuery = 'family=Inter:wght@300;400;600';
            if (currentTheme.id === 'lookbook') fontQuery = 'family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600';
            if (currentTheme.id === 'valentine') fontQuery = 'family=Great+Vibes&family=Lato:wght@300;400;700';
            if (currentTheme.id === 'astrology') fontQuery = 'family=Cinzel:wght@400;700&family=Montserrat:wght@300;400';
            if (currentTheme.id === 'memories') fontQuery = 'family=Courier+Prime:wght@400;700&family=Merriweather:wght@300;400';
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
        }
    }, [currentTheme]);

    const startNewProject = useCallback(async (theme: ThemeConfig) => {
        const newSpreads = generateSpreads();

        try {
            // Wait for DB to generate ID and save
            const savedProject = await fetchApi<Project>('/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Новый проект',
                    themeId: theme.id,
                    isCustom: false,
                    price: theme.price,
                    spreads: newSpreads
                })
            });

            setProjects(prev => [savedProject, ...prev]);
            setCurrentTheme(theme);
            setActiveProjectId(savedProject.id);

            return { project: savedProject, spreads: newSpreads };
        } catch (e) {
            console.error("Failed to start new project", e);
            throw e;
        }
    }, [currentUser]);

    const openProject = useCallback((project: Project, theme?: ThemeConfig) => {
        const pTheme = theme || THEMES.find(t => t.id === project.themeId) || THEMES[0];
        setCurrentTheme(pTheme);
        setActiveProjectId(project.id);
        const initialSpreads = project.spreads?.length > 0 ? project.spreads : generateSpreads();
        return { theme: pTheme, spreads: initialSpreads };
    }, []);

    const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
        // Optimistic UI update
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));

        try {
            await fetchApi<Project>(`/projects/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error("Failed to sync project update to backend", e);
            // In a robust implementation, revert the optimistic update here.
        }
    }, []);

    const deleteProject = useCallback(async (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        try {
            await fetchApi(`/projects/${projectId}`, { method: 'DELETE' });
        } catch (e) {
            console.error("Failed to delete", e);
        }
    }, []);

    const visibleProjects = useMemo(() => {
        // Since backend already filters for GUEST/USER correctly (see backend router),
        // we mainly trust the data. But if we want local filtering:
        return projects.filter(p => {
            if (role === 'ADMIN') return true;
            return true; // The backend only sent us what we are allowed to see
        });
    }, [projects, role]);

    return {
        projects: visibleProjects,
        activeProjectId,
        currentTheme,
        startNewProject,
        openProject,
        updateProject,
        deleteProject,
        loadProjectById
    };
}
