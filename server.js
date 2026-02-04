// ===== Simple Backend API Server =====
// This is a Node.js/Express backend example
// Install dependencies: npm install express cors body-parser
// Run: node server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "books-data.json");
const ADMIN_FILE = path.join(__dirname, "admins-data.json");

const INITIAL_BOOKS = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(".")); // Serve static files

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  console.log("Creating data file from INITIAL_BOOKS...");
  fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_BOOKS, null, 2));
} else {
  console.log("Loading books from existing books-data.json");
}

if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify([]));
}

// Helper function to read books
function readBooks() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write books
function writeBooks(books) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
}

// Helper function to read admins
function readAdmins() {
  try {
    const data = fs.readFileSync(ADMIN_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write admins
function writeAdmins(admins) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admins, null, 2));
}

// ===== API Routes =====

// GET all books
app.get("/api/books", (req, res) => {
  const books = readBooks();
  res.json({ books, success: true });
});

// GET single book by ID
app.get("/api/books/:id", (req, res) => {
  const books = readBooks();
  const book = books.find((b) => b.id === parseInt(req.params.id));

  if (!book) {
    return res.status(404).json({ error: "Book not found", success: false });
  }

  res.json({ book, success: true });
});

// POST add new book
app.post("/api/books", (req, res) => {
  const books = readBooks();
  const { title, author, price, image, description, content, category } =
    req.body;

  if (!title || !author || !image || !description || !content) {
    return res
      .status(400)
      .json({ error: "Missing required fields", success: false });
  }

  const newBook = {
    id: Date.now(),
    title,
    author,
    price: parseFloat(price).toFixed(2),
    image,
    description,
    content,
    category: category || "selling",
    createdAt: new Date().toISOString(),
  };

  books.push(newBook);
  writeBooks(books);

  res.json({ book: newBook, success: true });
});

// PUT update book
app.put("/api/books/:id", (req, res) => {
  const books = readBooks();
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found", success: false });
  }

  const { title, author, price, image, description, content, category } =
    req.body;

  books[bookIndex] = {
    ...books[bookIndex],
    title,
    author,
    price: parseFloat(price).toFixed(2),
    image,
    description,
    content,
    category,
    updatedAt: new Date().toISOString(),
  };

  writeBooks(books);

  res.json({ book: books[bookIndex], success: true });
});

// DELETE book
app.delete("/api/books/:id", (req, res) => {
  const books = readBooks();
  const bookId = parseInt(req.params.id);
  const filteredBooks = books.filter((b) => b.id !== bookId);

  if (books.length === filteredBooks.length) {
    return res.status(404).json({ error: "Book not found", success: false });
  }

  writeBooks(filteredBooks);

  res.json({ success: true, message: "Book deleted successfully" });
});

// POST admin signup
app.post("/api/admin/signup", (req, res) => {
  const admins = readAdmins();
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields", success: false });
  }

  if (admins.find((a) => a.email === email)) {
    return res
      .status(400)
      .json({ error: "Admin already exists", success: false });
  }

  const newAdmin = {
    id: Date.now(),
    name,
    email,
    password, // Note: In a real app, hash this password!
    createdAt: new Date().toISOString(),
  };

  admins.push(newAdmin);
  writeAdmins(admins);

  res.json({
    admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email },
    success: true,
  });
});

// POST admin login
app.post("/api/admin/login", (req, res) => {
  const admins = readAdmins();
  const { email, password } = req.body;

  const admin = admins.find(
    (a) => a.email === email && a.password === password,
  );

  if (!admin) {
    return res
      .status(401)
      .json({ error: "Invalid credentials", success: false });
  }

  res.json({
    admin: { id: admin.id, name: admin.name, email: admin.email },
    success: true,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BookHome API Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/books`);
});
