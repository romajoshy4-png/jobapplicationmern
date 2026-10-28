import { Router } from 'express';
import * as controller from '../controllers/applications.js';

const router = Router();
router.get('/', controller.listApplications);
router.post('/', controller.createApplication);
router.get('/:id', controller.getApplication);
router.patch('/:id', controller.updateApplication);
router.patch('/:id/status', controller.changeStatus);
router.delete('/:id', controller.deleteApplication);
export default router;
