import Queue from 'bull'; // Import the Bull queue for job processing
import imageThumbnail from 'image-thumbnail'; // Import the image-thumbnail library to create thumbnails
import { promises as fs } from 'fs'; // Import fs.promises for file system operations (async/await)
import { ObjectID } from 'mongodb'; // Import ObjectID to work with MongoDB's unique identifiers
import dbClient from './utils/db'; // Import the database client to interact with MongoDB

// Create two queues for file and user job processing
const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379'); 
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

// Function to generate a thumbnail of an image with a specified width
async function thumbNail(width, localPath) {
  const thumbnail = await imageThumbnail(localPath, { width }); // Generate thumbnail using the image-thumbnail library
  return thumbnail; // Return the generated thumbnail
}

// Process jobs in the fileQueue
fileQueue.process(async (job, done) => {
  console.log('Processing...'); // Log that job processing has started
  const { fileId } = job.data; // Extract fileId from the job data
  if (!fileId) {
    done(new Error('Missing fileId')); // Handle error if fileId is missing
  }

  const { userId } = job.data; // Extract userId from the job data
  if (!userId) {
    done(new Error('Missing userId')); // Handle error if userId is missing
  }

  console.log(fileId, userId); // Log the fileId and userId for debugging
  const files = dbClient.db.collection('files'); // Access the 'files' collection in MongoDB
  const idObject = new ObjectID(fileId); // Convert fileId to an ObjectID
  files.findOne({ _id: idObject }, async (err, file) => { // Find the file in the database
    if (!file) {
      console.log('Not found'); // Log if the file was not found in the database
      done(new Error('File not found')); // Handle error if file not found
    } else {
      const fileName = file.localPath; // Get the file's local path
      const thumbnail500 = await thumbNail(500, fileName); // Generate 500px thumbnail
      const thumbnail250 = await thumbNail(250, fileName); // Generate 250px thumbnail
      const thumbnail100 = await thumbNail(100, fileName); // Generate 100px thumbnail

      console.log('Writing files to system'); // Log the process of writing thumbnails to the file system
      const image500 = `${file.localPath}_500`; // Define the file path for the 500px thumbnail
      const image250 = `${file.localPath}_250`; // Define the file path for the 250px thumbnail
      const image100 = `${file.localPath}_100`; // Define the file path for the 100px thumbnail

      await fs.writeFile(image500, thumbnail500); // Write the 500px thumbnail to the system
      await fs.writeFile(image250, thumbnail250); // Write the 250px thumbnail to the system
      await fs.writeFile(image100, thumbnail100); // Write the 100px thumbnail to the system
      done(); // Mark the job as complete
    }
  });
});

// Process jobs in the userQueue
userQueue.process(async (job, done) => {
  const { userId } = job.data; // Extract userId from the job data
  if (!userId) done(new Error('Missing userId')); // Handle error if userId is missing
  const users = dbClient.db.collection('users'); // Access the 'users' collection in MongoDB
  const idObject = new ObjectID(userId); // Convert userId to an ObjectID
  const user = await users.findOne({ _id: idObject }); // Find the user in the database
  if (user) {
    console.log(`Welcome ${user.email}!`); // Log the user's email if found
  } else {
    done(new Error('User not found')); // Handle error if the user is not found
  }
});
