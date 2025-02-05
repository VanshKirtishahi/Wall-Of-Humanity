const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filePath) => {
  try {
    await fs.access(filePath); // Check if file exists
    await fs.unlink(filePath); // Delete the file
    console.log('File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const deleteUploadedImage = async (filename, folder) => {
  if (!filename) return false;
  
  const imagePath = path.join(__dirname, `../uploads/${folder}`, filename);
  return await deleteFile(imagePath);
};

module.exports = {
  deleteFile,
  deleteUploadedImage
}; 