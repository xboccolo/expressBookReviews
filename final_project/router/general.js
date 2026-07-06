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
   // Check if the username is valid and not already taken
   if (isValid(username)) {
     users.push({"username": username, "password": password});
     return res.status(200).send(JSON.stringify({message: "User successfully registered. Now you can login"}, null, 4));  
   } else {
     // Return 409 Conflict if the user already exists
     return res.status(409).send(JSON.stringify({message: "User already exists!"}, null, 4));  
   }
 }
 // Return 400 Bad Request if username or password parameters are missing
 return res.status(400).send(JSON.stringify({message: "Unable to register user. Missing username or password."}, null, 4)); 
});

// Get method for showing the book list available in the shop
public_users.get('/', (req, res) => {
  // Simulate an asynchronous operation using a Promise with a 1-second delay
  const fetchBooksAsync = new Promise((resolve, reject) => {
    setTimeout( () => {
      if (books) {
        resolve(books);
      } else {
        reject("Error fetching books");
      }
    }, 1000); 
  });

  // Handle the Promise resolution and rejection using .then() and .catch()
  fetchBooksAsync
    .then( (booksData) => {
      // Executed if resolve is called
      return res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch( (error) => {
      // Executed if reject is called
      return res.status(500).send(error);
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  // Simulate an asynchronous database operation using a Promise with a 1-second delay
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
    // Wait for the promise to resolve and store the value using async/await
    const book = await fetchBookByIsbn; 
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    // Handle failure if the book is not found
    return res.status(404).json({ message: error });
  }
});
 
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;

  // Simulate an asynchronous operation using a Promise with a 1-second delay
  const fetchBooksByAuthor = new Promise((resolve, reject) => {
    setTimeout( () => {
      let keys = Object.keys(books);
      let booksByAuthor = [];

      // Iterate through the books object to find matching authors (case-insensitive)
      for (let i=0; i<keys.length; i++) {
        let isbn = keys[i];
        if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
          booksByAuthor.push(books[isbn]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found");
      }
    }, 1000); 
  });

  // Handle the Promise resolution and rejection using .then() and .catch()
  fetchBooksByAuthor
    .then( (booksData) => {
      // Executed if resolve is called
      return res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch( (error) => {
      // Executed if reject is called
      return res.status(500).send(error);
    })
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  let title = req.params.title;

  // Simulate an asynchronous operation using a Promise with a 1-second delay
  const fetchBooksByTitle = new Promise((resolve, reject) => {
    setTimeout( () => {
      let keys = Object.keys(books);
      let booksByTitle = [];

      // Iterate through the books object to find matching titles (case-insensitive)
      for (let i=0; i<keys.length; i++) {
        let isbn = keys[i];
        if (books[isbn].title && books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle.push(books[isbn]);
        } 
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("No books found");
      }
    }, 1000); 
  });

  try {
    // Wait for the promise to resolve and store the value using async/await
    const booksData = await fetchBooksByTitle;
    return res.status(200).send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    // Handle failure if no books match the title
    return res.status(500).send(error);
  } 
});

// Get book review using ISBN as a parameter
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  const book = books[isbn];

  // Return 404 if the book does not exist
  if (!book) {
    return res.status(404).send(JSON.stringify({message: "Book not found"}, null, 4));  
  }

  // Return 404 if the book exists but has no reviews
  const reviews = Object.keys(book.reviews);
  if (!book.reviews || reviews.length === 0) {
    return res.status(404).send(JSON.stringify({message: "Review not found"}, null, 4));
  } else {
     // Return the book reviews if found
     return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
});

module.exports.general = public_users;