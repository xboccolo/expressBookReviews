const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
 let username = req.body.username;
 let password = req.body.password;
 if (username && password) {
   if (isValid(username)) {
     users.push({"username": username, "password": password});
     return res.status(200).send(JSON.stringify({message: "User successfully registered. Now you can login"}, null, 4));  
   } else {
     return res.status(409).send(JSON.stringify({message: "User already exists!"}, null, 4)); // Cambiato in 409 (Conflict), più adatto di 404  
   }
 }
 return res.status(400).send(JSON.stringify({message: "Unable to register user. Missing username or password."}, null, 4)); // Cambiato in 400 (Bad Request)  
});

// Get method for showing the book list available in the shop
public_users.get('/', (req, res) => {
  //res.send(JSON.stringify(books, null, 4));

  const fetchBooksAsync = new Promise((resolve, reject) => {
    setTimeout( () => {
      if (books) {
        resolve(books);
      } else {
        reject("Error fetching books");
      }
    }, 1000); // ritardo simulato di 1 s. 
    });

  fetchBooksAsync
    .then( (booksData) => {
      // viene eseguito se viene chiamato resolve.
      return res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch( (error) => {
      // viene eseguito se viene chiamato reject.
      return res.status(500).send(error);
    })
  });

/*
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });

 // async prima della funzione (req, res) => {...}
 //
*/
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
    // Aspetto che la promessa si risolva e salvo il valore
    const book = await fetchBookByIsbn; 
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    // Gestisco il fallimento
    return res.status(404).json({ message: error });
  }
});
 
/*
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  // let keys = Object.keys(books) restituisce un array con i parametri.
  // quindi title, author, etc.
  // let values = Object.values(books) restituisce un array con i valori
  // relativi ai parametri.
  // let entries = Object.entries(books) restituisce un array multidimensionale
  // con parametri e valori associati.
  let keys = Object.keys(books);
  let booksByAuthor = [];
  for (let i=0; i<keys.length; i++) {
    let isbn = keys[i];
    if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
      booksByAuthor.push(books[isbn]);
    }
  }
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
      return res.status(404).json({message: "No books found"});
    }
});
*/

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
          reject("No books found");
        }
    }, 1000); // ritardo simulato di 1 s. 
    });

  fetchBooksByAuthor
    .then( (booksData) => {
      // viene eseguito se viene chiamato resolve.
      return res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch( (error) => {
      // viene eseguito se viene chiamato reject.
      return res.status(500).send(error);
    })
  });

/*
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title;
  
  let keys = Object.keys(books);
  let booksByTitle = [];

  for (let i=0; i<keys.length; i++) {
    let isbn = keys[i];
    if (books[isbn].title && books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
      booksByTitle.push(books[isbn]);
    } 
  } if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({message: "No books found"});
  }
});
*/

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
        reject("No books found");
      }
    }, 1000); // ritardo simulato di 1 s. 
    });
    try {
      // Aspetto che la promessa si risolva e salvo il valore
      const booksData = await fetchBooksByTitle;
      return res.status(200).send(JSON.stringify(booksData, null, 4));
    } catch (error) {
      // Gestisco il fallimento
      return res.status(500).send(error);
    } 
});

//  Get book review using ISBN as a parameter
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  const book = books[isbn];
  //se il libro non esiste
  if (!book) {
    return res.status(404).send(JSON.stringify({message: "Book not found"}, null, 4));  
  }
  // se il libro esiste, ma non ha recensioni
  const reviews = Object.keys(book.reviews);
  if (!book.reviews || reviews.length === 0) {
    return res.status(404).send(JSON.stringify({message: "Review not found"}, null, 4));
  } else {
     return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
});

module.exports.general = public_users;
