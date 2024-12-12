// Import necessary libraries and modules
import { v4 as uuidv4 } from 'uuid'; // Generates unique identifiers
import { promises as fs } from 'fs'; // Handles file system operations using promises
import { ObjectID } from 'mongodb'; // Handles MongoDB ObjectID operations
import mime from 'mime-types'; // Determines file MIME types
import Queue from 'bull'; // Implements job queues
import dbClient from '../utils/db'; // Database client utility
import redisClient from '../utils/redis'; // Redis client utility

// Define a job queue for file-related tasks
const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

// Controller class for file operations
class FilesController {
  // Retrieve the user associated with the given token
  static async getUser(request) {
    const token = request.header('X-Token'); // Extract the token from the request header
    const key = `auth_${token}`; // Generate Redis key for the token
    const userId = await redisClient.get(key); // Get user ID from Redis
    if (userId) {
      const users = dbClient.db.collection('users'); // Access the 'users' collection
      const idObject = new ObjectID(userId); // Create an ObjectID instance for the user ID
      const user = await users.findOne({ _id: idObject }); // Retrieve user document
      if (!user) {
        return null; // Return null if user does not exist
      }
      return user; // Return user document if found
    }
    return null; // Return null if token is not found in Redis
  }

  // Handle file upload requests
  static async postUpload(request, response) {
    const user = await FilesController.getUser(request); // Authenticate the user
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' }); // Respond with error if user is not authenticated
    }
    const { name } = request.body; // Extract file name
    const { type } = request.body; // Extract file type
    const { parentId } = request.body; // Extract parent folder ID
    const isPublic = request.body.isPublic || false; // Determine public visibility
    const { data } = request.body; // Extract file data
    if (!name) {
      return response.status(400).json({ error: 'Missing name' }); // Respond with error if name is missing
    }
    if (!type) {
      return response.status(400).json({ error: 'Missing type' }); // Respond with error if type is missing
    }
    if (type !== 'folder' && !data) {
      return response.status(400).json({ error: 'Missing data' }); // Respond with error if data is missing for non-folder types
    }

    const files = dbClient.db.collection('files'); // Access the 'files' collection
    if (parentId) {
      const idObject = new ObjectID(parentId); // Create ObjectID instance for parentId
      const file = await files.findOne({ _id: idObject, userId: user._id }); // Verify if parent folder exists
      if (!file) {
        return response.status(400).json({ error: 'Parent not found' }); // Respond with error if parent folder is not found
      }
      if (file.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' }); // Respond with error if parent is not a folder
      }
    }
    if (type === 'folder') {
      files.insertOne(
        {
          userId: user._id, // Set user ID
          name, // Set folder name
          type, // Set type to 'folder'
          parentId: parentId || 0, // Set parentId or default to 0
          isPublic, // Set public visibility
        },
      ).then((result) => response.status(201).json({
        id: result.insertedId, // Return inserted folder ID
        userId: user._id, // Return user ID
        name, // Return folder name
        type, // Return folder type
        isPublic, // Return public visibility
        parentId: parentId || 0, // Return parentId
      })).catch((error) => {
        console.log(error); // Log error on insertion failure
      });
    } else {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager'; // Define file storage path
      const fileName = `${filePath}/${uuidv4()}`; // Generate unique file name
      const buff = Buffer.from(data, 'base64'); // Decode base64 data to binary
      try {
        try {
          await fs.mkdir(filePath); // Create file directory if it does not exist
        } catch (error) {
          // Ignore error if directory already exists
        }
        await fs.writeFile(fileName, buff, 'utf-8'); // Save file to disk
      } catch (error) {
        console.log(error); // Log file saving error
      }
      files.insertOne(
        {
          userId: user._id, // Set user ID
          name, // Set file name
          type, // Set file type
          isPublic, // Set public visibility
          parentId: parentId || 0, // Set parentId or default to 0
          localPath: fileName, // Set local file path
        },
      ).then((result) => {
        response.status(201).json(
          {
            id: result.insertedId, // Return inserted file ID
            userId: user._id, // Return user ID
            name, // Return file name
            type, // Return file type
            isPublic, // Return public visibility
            parentId: parentId || 0, // Return parentId
          },
        );
        if (type === 'image') {
          fileQueue.add(
            {
              userId: user._id, // Add user ID to job queue
              fileId: result.insertedId, // Add file ID to job queue
            },
          );
        }
      }).catch((error) => console.log(error)); // Log insertion error
    }
    return null; // End function
  }

  // Other methods omitted for brevity but similarly include comments for functionality and logic
}

module.exports = FilesController; // Export the controller class
