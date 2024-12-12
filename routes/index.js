import { Router } from 'express';  // Import the Router function from Express to define routes
import AppController from '../controllers/AppController';  // Import the AppController for app-related functionality
import UsersController from '../controllers/UsersController';  // Import the UsersController for handling user-related routes
import AuthController from '../controllers/AuthController';  // Import the AuthController for handling authentication routes
import FilesController from '../controllers/FilesController';  // Import the FilesController for file-related routes

const router = Router();  // Initialize a new Express Router instance

// **AppController endpoints** - These handle application status and statistics
router.get('/status', AppController.getStatus);  // Endpoint to check the status of the application
router.get('/stats', AppController.getStats);  // Endpoint to get application statistics

// **UsersController endpoints** - These handle user-related actions
router.post('/users', UsersController.postNew);  // Endpoint to create a new user

// **AuthController endpoints** - These handle user authentication actions
router.get('/connect', AuthController.getConnect);  // Endpoint for user login/connect
router.get('/disconnect', AuthController.getDisconnect);  // Endpoint for user logout/disconnect

// **UsersController endpoint for retrieving current user data**
router.get('/users/me', UsersController.getMe);  // Endpoint to get the current logged-in user's data

// **FilesController endpoints** - These handle file upload and file-related actions
router.post('/files', FilesController.postUpload);  // Endpoint to upload a file

router.get('/files/:id', FilesController.getShow);  // Endpoint to get information about a specific file by its ID
router.get('/files', FilesController.getIndex);  // Endpoint to list all files

// **FilesController endpoints for publishing and unpublishing files**
router.put('/files/:id/publish', FilesController.putPublish);  // Endpoint to publish a specific file
router.put('/files/:id/unpublish', FilesController.putUnpublish);  // Endpoint to unpublish a specific file

// **File data endpoint** - This handles file data retrieval
router.get('/files/:id/data', FilesController.getFile);  // Endpoint to retrieve the actual data of a specific file

// Export the router so it can be used in the main app
export default router;
