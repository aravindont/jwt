// Import required libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const PORT = 8000;
// Create an instance of Express
const app = express();
app.use(express.json());

// Secret key for JWT
const secretKey = "qwerasdfg";

// Dummy database to store user credentials
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  // Extract JWT from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    // No token provided, return unauthorized
    return res.sendStatus(401);
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      // Invalid token, return forbidden
      return res.sendStatus(403);
    }

    // Valid token, store user in request object
    req.user = user;

    // Proceed to the next middleware
    next();
  });
};

// API endpoint for user sign-up
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  // In a real scenario, you would validate and hash the password before storing it

  // Add the user to the database
  users.push({ id: users.length + 1, username, password });

  res.status(200).json({ message: "User registered successfully" });
});

// API endpoint for user login and JWT generation
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate a JWT
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
});

// Protected route
app.get("/dashboard", authenticateToken, async (req, res) => {
  // Access user information from request object
  const { id, username } = req.user;

  try {
    // Fetch 20 posts from JSONPlaceholder API
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=20"
    );
    const posts = await response.json();

    // Return user-specific data and fetched posts
    res.status(200).json({ id, username, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
