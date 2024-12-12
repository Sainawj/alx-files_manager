const Queue = require('bull');  // Import the Bull queue library for job management
const imageThumbnail = require('image-thumbnail');  // Import the image-thumbnail package for generating image thumbnails
const dbClient = require('./utils/db');  // Import the database client to interact with the database

// Initialize a new queue for file processing tasks
const fileQueue = new Queue('fileQueue');

// Process the tasks in the file queue
fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;  // Extract userId and fileId from the job data

  // Validate that fileId and userId are provided
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  // Fetch the file document from the database to check if it exists for the given user
  const fileDocument = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!fileDocument) {
    throw new Error('File not found');
  }

  // Generate a thumbnail of the image with a width of 500 pixels
  const options = { width: 500 };
  const thumbnail500 = await imageThumbnail(fileDocument.localPath, options);

  // Return the generated thumbnail (other thumbnails can be added as needed)
  return { thumbnail500 /* other thumbnails */ };
});

// Initialize a new queue for user-related tasks
const userQueue = new Queue('userQueue');

// Process the tasks in the user queue
userQueue.process(async (job) => {
  const { userId } = job.data;  // Extract userId from the job data

  // Validate that userId is provided
  if (!userId) {
    throw new Error('Missing userId');
  }

  // Fetch the user document from the database to check if the user exists
  const userDocument = await dbClient.db.collection('users').findOne({ _id: userId });
  if (!userDocument) {
    throw new Error('User not found');
  }

  // Log a welcome message for the user
  console.log(`Welcome ${userDocument.email}!`);

  // Return the userId as part of the job result
  return { userId };
});

// Export the queues to be used in other parts of the application
module.exports = { fileQueue, userQueue };