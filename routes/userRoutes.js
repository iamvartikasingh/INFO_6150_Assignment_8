const express = require('express');
const multer = require('multer');
const User = require('../models/User'); // Import your User model
const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Destination folder for storing images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

// File filter to accept only JPEG, PNG, and GIF formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
  }
};

// Set up Multer middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// POST /user/uploadImage
router.post('/uploadImage', upload.single('image'), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or unsupported file format.' });
    }

    // Save the image path to the user's record in the database
    user.imagePath = req.file.path;
    await user.save();

    res.status(200).json({ message: 'Image uploaded successfully', path: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;