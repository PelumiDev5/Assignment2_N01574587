/* 
Pelumi Owoshagba
N01574587
*/
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static('uploads'));

// middleware:
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.route("/upload")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(`File uploaded successfully: ${req.file.path}`);
  });

app.route("/upload-multiple")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
  })
  .post(upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const filePaths = req.files.map((file) => file.path);
    res.status(200).send(`Files uploaded successfully: ${filePaths.join(", ")}`);
  });

app.get("/fetch-single", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({ message: "No images" });
  }
  let max = uploads.length - 1;
  let min = 0;
  let index = Math.round(Math.random() * (max - min) + min);
  let randomImage = uploads[index];
  res.sendFile(path.join(upload_dir, randomImage));
});

app.get("/single", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "single.html"));
});

// Handle multiple random images
app.get("/fetch-multiple", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({ message: "No images" });
  }
  let randomImages = [];
  let count = Math.min(5, uploads.length); // Get 5 random images or less if fewer images exist
  for (let i = 0; i < count; i++) {
    let index = Math.floor(Math.random() * uploads.length);
    randomImages.push(uploads[index]);
    uploads.splice(index, 1); // Remove selected image to avoid duplicates
  }
  res.json(randomImages);
});

app.get("/multiple", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "multiple.html"));
});

// Handle all images
app.get("/fetch-all", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({ message: "No images" });
  }
  res.json(uploads);
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

// Handle pagination
app.get("/fetch-all-pagination/pages/:index", (req, res) => {
  const itemsPerPage = 10;
  const page = parseInt(req.params.index) || 1;
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({ message: "No images" });
  }
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, uploads.length);
  const filesToDisplay = uploads.slice(startIndex, endIndex);
  res.json({ files: filesToDisplay, currentPage: page, totalPages: Math.ceil(uploads.length / itemsPerPage) });
});

app.get("/gallery-pagination", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery-pagination.html"));
});

// catch all other requests
app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
