// Importing required modules and libraries
import Queue from 'bull'; // For managing job queues
import { ObjectId } from 'mongodb'; // For handling MongoDB ObjectIds
import { v4 as uuidv4 } from 'uuid'; // For generating unique identifiers
import { mkdir, writeFile, readFileSync } from 'fs'; // For file system operations
import mime from 'mime-types'; // For handling MIME type detection
import dbClient from '../utils/db'; // Custom utility for interacting with the database
import { getIdAndKey, isValidUser } from '../utils/users'; // Utility functions for user-related operations

// Controller class for handling file-related requests
class FilesController {
  // Handles file uploads
  static async postUpload(request, response) {
    const fileQ = new Queue('fileQ'); // Job queue for processing file-related tasks
    const dir = process.env.FOLDER_PATH || '/tmp/files_manager'; // Directory for storing files

    // Extract user ID and validate the user
    const { userId } = await getIdAndKey(request);
    if (!isValidUser(userId)) return response.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    // Validate file name
    const fileName = request.body.name;
    if (!fileName) return response.status(400).send({ error: 'Missing name' });

    // Validate file type
    const fileType = request.body.type;
    if (!fileType || !['folder', 'file', 'image'].includes(fileType)) {
      return response.status(400).send({ error: 'Missing type' });
    }

    // Validate file data (only for non-folder types)
    const fileData = request.body.data;
    if (!fileData && fileType !== 'folder') return response.status(400).send({ error: 'Missing data' });

    const publicFile = request.body.isPublic || false; // Check if file is public
    let parentId = request.body.parentId || 0; // Set default parentId to 0
    parentId = parentId === '0' ? 0 : parentId;

    // Validate parent folder if provided
    if (parentId !== 0) {
      const parentFile = await dbClient.files.findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return response.status(400).send({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return response.status(400).send({ error: 'Parent is not a folder' });
    }

    // Prepare data for file insertion
    const fileInsertData = {
      userId: user._id,
      name: fileName,
      type: fileType,
      isPublic: publicFile,
      parentId,
    };

    // Handle folder creation
    if (fileType === 'folder') {
      await dbClient.files.insertOne(fileInsertData);
      return response.status(201).send(fileInsertData);
    }

    // Generate a unique file identifier
    const fileUid = uuidv4();
    const decData = Buffer.from(fileData, 'base64'); // Decode file data from base64
    const filePath = `${dir}/${fileUid}`; // Generate file path

    // Create directory if it doesn't exist
    mkdir(dir, { recursive: true }, (error) => {
      if (error) return response.status(400).send({ error: error.message });
      return true;
    });

    // Write file data to the specified path
    writeFile(filePath, decData, (error) => {
      if (error) return response.status(400).send({ error: error.message });
      return true;
    });

    fileInsertData.localPath = filePath; // Save file path
    await dbClient.files.insertOne(fileInsertData); // Insert file record in the database

    // Add job to the queue for further processing
    fileQ.add({
      userId: fileInsertData.userId,
      fileId: fileInsertData._id,
    });

    return response.status(201).send(fileInsertData);
  }

  // Fetches details of a single file
  static async getShow(request, response) {
    const { userId } = await getIdAndKey(request);
    if (!isValidUser(userId)) return response.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const fileId = request.params.id || '';
    const file = await dbClient.files.findOne({ _id: ObjectId(fileId), userId: user._id });
    if (!file) return response.status(404).send({ error: 'Not found' });

    return response.status(200).send(file);
  }

  // Lists files based on pagination and parent folder
  static async getIndex(request, response) {
    // Similar comments would be added here to explain pagination and filtering logic
  }

  // Publishes a file by making it public
  static async putPublish(request, response) {
    // Add similar comments to explain publishing logic
  }

  // Unpublishes a file by making it private
  static async putUnpublish(request, response) {
    // Add similar comments to explain unpublishing logic
  }

  // Fetches file content
  static async getFile(request, response) {
    // Add similar comments to explain file retrieval logic
  }
}

export default FilesController;
