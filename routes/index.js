import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

// Create a new router instance
const router = Router();

// Route to get the server status (e.g., if the API is running correctly)
router.get('/status', AppController.getStatus);

// Route to get application statistics (e.g., user count, file count)
router.get('/stats', AppController.getStats);

// Route to register a new user
router.post('/users', UsersController.postNew);

// Route to authenticate and establish a session for a user
router.get('/connect', AuthController.getConnect);

// Route to disconnect a user (logout and invalidate session)
router.get('/disconnect', AuthController.getDisconnect);

// Route to fetch the authenticated user's details
router.get('/users/me', UsersController.getMe);

// Route to upload a file
router.post('/files', FilesController.postUpload);

// Route to get metadata of a specific file by ID
router.get('/files/:id', FilesController.getShow);

// Route to get a list of files
router.get('/files', FilesController.getIndex);

// Route to publish a specific file by ID
router.put('/files/:id/publish', FilesController.putPublish);

// Route to unpublish a specific file by ID
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// Route to download or access the actual content of a file by ID
router.get('/files/:id/data', FilesController.getFile);

// Export the router to be used in the main app
module.exports = router;
