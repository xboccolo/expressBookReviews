const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []

// Check if a user with the given username already exists
const isValid = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return FALSE if any user with the same username is found (IT'S NOT VALID), 
    // otherwise TRUE (IT IS VALID).
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60});
      req.session.authorization = {accessToken, username}
      return res.status(200).send(JSON.stringify({message: `User ${username} successfully logged in`}, null, 4));
    } else {
      return res.status(208).send(JSON.stringify({message: "Invalid Login. Check username and password" }, null, 4));
    }
  }
  return res.status(404).send(JSON.stringify({message: "Error logging in" }, null, 4));
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  // Se l'utente non è loggato.
  if (!req.session.authorization) {
    return res.status(403).send(JSON.stringify({ message: "User not logged in" }, null, 4));
  }
  const { username } = req.session.authorization;
  // se manca il parametro recensione.
  if (!reviewText) {
    return res.status(400).send(JSON.stringify({message: "Review must be provided"}, null, 4));
  }
  // se il libro non esiste.
  if (!books[isbn]) {
    return res.status(404).send(JSON.stringify({message: "Book not found"}, null, 4));
  }
  // ora aggiunge o sovrascrive la recensione de determinato utente.
  books[isbn].reviews[username] = reviewText;
   return res.status(200).send(JSON.stringify({ 
    message: `Review for '${books[isbn].title}' successfully added`,
    author: username,
    review: reviewText,
   }, null, 4));
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username } = req.session.authorization;
  // se il libro non esiste.
  if (!books[isbn]) {
    return res.status(404).send(JSON.stringify({message: "Book not found"}, null, 4));  
  }
  // se non esiste la recensione.
  if (!books[isbn].reviews[username]) {
    return res.status(404).send(JSON.stringify({message: "Review not found"}, null, 4));  
  }
  // ora cancella la recensione.
  delete books[isbn].reviews[username];
  return res.status(200).send(JSON.stringify({
      message: `Review for '${books[isbn].title}' successfully deleted by user ${username}`
  }, null, 4));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
