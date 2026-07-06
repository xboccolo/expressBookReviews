const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Route to register a new user
public_users.post("/register", (req,res) => {
 let username = req.body.username;
 let password = req.body.password;

 if (username && password) {
   if (isValid(username)) {
     users.push({"username": username, "password": password});
     return res.status(201).json({ message: "User registered successfully" });  
   } else {
     return res.status(409).json({ message: "Username already exists" });  
   }
 }
 return res.status(400).json({ message: "Username and password are required" }); 
});

// Get method for showing the book list available in the shop
public_users.get('/', (req, res) => {
  const fetchBooksAsync = new Promise((resolve, reject) => {
    setTimeout( () => {
      if (books) {
        resolve(books);
      } else {
        reject("Error getting book list");
      }
    }, 1000); 
  });

  fetchBooksAsync
    .then( (booksData) => {
      return res.status(200).json(booksData);
    })
    .catch( (error) => {
      return res.status(500).json({ message: error });
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const fetchBookByIsbn = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[req.params.isbn]) {
        resolve(books[req.params.isbn]);
      } else {
        reject("Book not found");
      }
    }, 1000);
  });

  try {
    const book = await fetchBookByIsbn; 
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});
 
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;

  const fetchBooksByAuthor = new Promise((resolve, reject) => {
    setTimeout( () => {
      let keys = Object.keys(books);
      let booksByAuthor = [];

      for (let i=0; i<keys.length; i++) {
        let isbn = keys[i];
        if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
          booksByAuthor.push(books[isbn]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found for author");
      }
    }, 1000); 
  });

  fetchBooksByAuthor
    .then( (booksData) => {
      return res.status(200).json(booksData);
    })
    .catch( (error) => {
      return res.status(404).json({ message: error });
    })
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  let title = req.params.title;

  const fetchBooksByTitle = new Promise((resolve, reject) => {
    setTimeout( () => {
      let keys = Object.keys(books);
      let booksByTitle = [];

      for (let i=0; i<keys.length; i++) {
        let isbn = keys[i];
        if (books[isbn].title && books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle.push(books[isbn]);
        } 
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("Book not found");
      }
    }, 1000); 
  });

  try {
    const booksData = await fetchBooksByTitle;
    return res.status(200).json(booksData);
  } catch (error) {
    return res.status(404).json({ message: error });
  } 
});

// Get book review using ISBN as a parameter
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });  
  }

  const reviews = Object.keys(book.reviews);
  if (!book.reviews || reviews.length === 0) {
    return res.status(404).json({ message: "Reviews not found" });
  } else {
     return res.status(200).json({ reviews: book.reviews });
  }
});

// ==========================================
// AXIOS ENDPOINTS (Tasks 10, 11, 12, 13)
// ==========================================

// Task 10: Get all books using Async/Await
public_users.get("/server/asynbooks", async function (req, res) {
  try {
    let response = await axios.get("http://localhost:5005/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error getting book list" });
  }
});

// Task 11: Get book details by ISBN using Promises
public_users.get("/server/asynbooks/isbn/:isbn", function (req, res) {
  let { isbn } = req.params;
  axios.get(`http://localhost:5005/isbn/${isbn}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      return res.status(500).json({ message: "Error while fetching book details." });
    });
});

// Task 12: Get book details by Author using Promises
public_users.get("/server/asynbooks/author/:author", function (req, res) {
  let { author } = req.params;
  axios.get(`http://localhost:5005/author/${author}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      return res.status(500).json({ message: "Error while fetching book details." });
    });
});

// Task 13: Get book details by Title using Promises
public_users.get("/server/asynbooks/title/:title", function (req, res) {
  let { title } = req.params;
  axios.get(`http://localhost:5005/title/${title}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      return res.status(500).json({ message: "Error while fetching book details." });
    });
});

module.exports.general = public_users;