const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const keys = require('../config/keys');

const { cloudName, apiKey, apiSecret, folder } = keys.cloudinary;

try {
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
  } else {
    console.warn('Missing Cloudinary keys. Config not initialized.');
  }
} catch (error) {
  console.warn('Cloudinary config initialization failed:', error);
}

exports.uploadImage = image =>
  new Promise((resolve, reject) => {
    if (!image) {
      return resolve({ imageUrl: '', imageKey: '' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          imageUrl: result.secure_url,
          imageKey: result.public_id
        });
      }
    );

    streamifier.createReadStream(image.buffer).pipe(uploadStream);
  });
