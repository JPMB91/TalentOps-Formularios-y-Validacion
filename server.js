const express = require('express');
const multer = require('multer');
const cors = require('cors');
// const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes'));
    }
  }
});


app.post('/upload', upload.single('imagen'), (req, res) => {
  res.json({ 
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename 
  });
});

// servir archivos estáticos
app.use('/uploads', express.static('uploads'));

app.listen(3002, () => {
  console.log('Server uploads en http://localhost:3002');
});