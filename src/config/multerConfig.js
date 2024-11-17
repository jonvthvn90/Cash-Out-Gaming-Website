const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/avatars'));
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using timestamp + random number + file extension
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Define file filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|svg/; // Allowed file extensions
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true); // Accept the file
    }
    
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes.toString()));
};

// Initialize multer for single file upload with the name 'avatar'
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000 // 1 MB max filesize
    },
    fileFilter: fileFilter
}).single('avatar');

// Error handler middleware for Multer
function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
            error: 'Multer error',
            message: err.message
        });
    } else if (err) {
        // An unknown error occurred when uploading
        return res.status(500).json({
            error: 'Upload error',
            message: err.message
        });
    }
    // Everything is ok, proceed with next middleware
    next();
}

module.exports = { upload, multerErrorHandler };