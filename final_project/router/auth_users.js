const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []

// Check if a user with the given username already exists
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

// only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60});
      req.session.authorization = {accessToken, username}
      // STANDARD: Messaggio pulito senza stringify
      return res.status(200).json({ message: "User successfully logged in" });
    } else {
      // STANDARD: 401 Unauthorized per credenziali errate (o 208 se richiesto esplicitamente dal test)
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  }
  return res.status(404).json({ message: "Error logging in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }
  const { username } = req.session.authorization;
  
  if (!reviewText) {
    return res.status(400).json({ message: "Review must be provided" });
  }
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  
  books[isbn].reviews[username] = reviewText;
  // STANDARD: Stringa esatta richiesta dai test '"message": "Review added/updated successfully"'
  return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }
  const { username } = req.session.authorization;
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });  
  }
  
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });  
  }
  
  delete books[isbn].reviews[username];
  // STANDARD: Stringa esatta richiesta dai test '"message": "Review deleted successfully"'
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;