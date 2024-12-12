import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dbClient from '../utils/db';
import fileQueue from '../worker';
import redisClient from '../utils/redis';

class FilesController {
  // Method to handle file upload
  static async postUpload(req, res) {
    try {
      // Ensure req.user is defined and contains userId (authentication check)
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name, type, data, parentId = 0, isPublic = false,
      } = req.body;
      const { userId } = req.user;

      // Check if the file name is provided
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      // Validate the file type (folder, file, image)
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type or invalid type' });
      }

      // If type is not folder, ensure data is provided (file contents)
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check if the parent folder exists, if applicable
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile || parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent not found or not a folder' });
        }
      }

      let localPath;
      // Handle file data if the type is not a folder
      if (type !== 'folder') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        localPath = path.join(folderPath, uuidv4());
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

        // If the file is an image, add a job to generate a thumbnail (using Bull queue)
        if (type === 'image') {
          await fileQueue.add({ userId, fileId: localPath });
        }
      }

      // Check authorization token in headers
      const token = req.headers.authorization;
      const redisToken = await redisClient.get(`auth_${token}`);
      if (!redisToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Create a new file record in the database
      const newFile = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: ObjectId(parentId),
        localPath: type !== 'folder' && localPath, // Only set localPath for non-folder types
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);

      // Return the file details along with its inserted ID
      return res.status(201).json({ ...newFile, id: result.insertedId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to get a specific file by ID
  static async getShow(req, res) {
    try {
      const { id } = req.params;

      // Ensure user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId } = req.user;

      // Fetch the file from the database, ensuring it belongs to the user
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

      // Return 404 if the file is not found
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to list files under a specific parent (with pagination)
  static async getIndex(req, res) {
    try {
      const { parentId = '0', page = '0' } = req.query;

      // Ensure user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId } = req.user;

      // Fetch files with pagination (20 files per page)
      const files = await dbClient.db.collection('files').aggregate([
        { $match: { parentId: ObjectId(parentId), userId: ObjectId(userId) } },
        { $skip: parseInt(page, 10) * 20 },
        { $limit: 20 },
      ]).toArray();

      return res.json(files);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to make a file public
  static async putPublish(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the file in the database
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Update the file to make it public
      await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });

      return res.status(200).json(file);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to unpublish a file (make it private)
  static async putUnpublish(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user && req.user.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the file in the database
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Update the file to make it private
      await dbClient.db.collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });

      return res.status(200).json(file);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to serve a file (download)
  static async getFile(req, res) {
    try {
      const { id } = req.params;

      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId } = req.user;

      // Fetch the file details from the database
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(id) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is public or belongs to the user
      if (!file.isPublic && file.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // Check if the file exists in the local path
      if (!fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Determine the MIME type of the file and serve it
      const mimeType = mime.getType(file.name);
      const fileContent = fs.readFileSync(file.localPath);
      res.setHeader('Content-Type', mimeType);

      return res.send(fileContent);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;