import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject, claimProjects } from '../controllers/projects.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// optionalAuth on all routes: attaches req.user if token is present, allows guests otherwise.
// Ownership checks are enforced inside the controllers.
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);
router.post('/', optionalAuth, createProject);
router.put('/:id', optionalAuth, updateProject);
router.patch('/claim', authenticate, claimProjects); // Claim guest projects after login
router.delete('/:id', authenticate, deleteProject);  // Delete always requires auth

export default router;
