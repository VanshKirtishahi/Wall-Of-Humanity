const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
}; 