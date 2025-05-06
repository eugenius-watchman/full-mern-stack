require("dotenv").config(); // Load environment variables / secret keys

const express = require("express"); // Import Express web framework
const app = express(); // Create the app
const cors = require("cors"); // Allowing requests from different domains
const mongoose = require("mongoose"); // MongoDB helper

// Import user model...blueprint for user data
const jwt = require("jsonwebtoken"); // JWT library for secure token generation/verification

const User = require("./models/user.models");
const Quote = require("./models/quote.models");


// middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // JSON data for communication with Express

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/full-mern-stack",
    {
      useNewUrlParser: true, // Better connection string parsing
      useUnifiedTopology: true, // Better server discovery
    }
  )
  .then(() => console.log("Connect to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  /**
   * 
    Security "guard" to check tokens:
    Looks for the token in the Authorization header
    If no token, sends back 401 (Unauthorized)
    If token exists, checks if valid
    If valid, lets the request continue
    If invalid, sends back 403 (Forbidden)
   */
  const authHeader = req.headers["authorization"]; // Get header
  const token = authHeader && authHeader.split(" ")[1]; // Extract token part

  if (!token) return res.sendStatus(401); // No token ...No entry

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Check token
    if (err) return res.sendStatus(403); // Bad token ... No entry
    req.user = user; // Attach user info to request
    next(); 
  });
};

// Routes
// Token Verification Route
app.get('/api/verify-token', authenticateToken, (req, res) => {
  /**
   Checking if token is still good:
    Uses authenticateToken middleware
    If it gets here, then token is valid
    Sending back the user info from token
   */
  res.json({
    valid: true, 
    user: req.user // From authenticateToken middleware
  });
});


// call app as a function to initialize a new application
// Registration controller/ route
app.post("/api/register", async (req, res) => {
  /**
   * 
    Creating new users:
    Checks if all required fields are there
    Creates user in database
    Returns user info (without password)
   */
  console.log("New registration attempt:", req.body); // log incoming data
  try {
    // Validate required fields first
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }
    // Create user with ALL parameters from schema
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword, // hashed automatically
      phone: req.body.phone,
      gender: req.body.gender,
      age: req.body.age,
      agreeToTerms: req.body.agreeToTerms,
      quotes: [],
    });

    // Successful response and omitting password (Don't send back) in response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Success
    res.status(201).json({
      status: "success",
      user: userResponse,
    });
  } catch (err) {
    console.error("Registration error:", err);

    // Handle different error types
    let errorMessage = "Registration failed";
    let statusCode = 500;

    if (err.name === "ValidationError") {
      // Mongoose validation error ...e.g email format
      statusCode = 400;
      errorMessage = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
    } else if (err.code === 11000) {
      // Duplicate key error ...e.g email already exists
      statusCode = 409;
      errorMessage = "Duplicate email or Email already in use";
    }
    res.status(statusCode).json({
      status: "error",
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
  // app.post("/api/login", async (req, res) => {
  //   const user = await User.findOne({
  //     email: req.body.email,
  //     password: req.body.password,
  //   })
  //   if(user){
  //     return res.json({starus: "ok", user: true})
  //   }else {
  //     return res.json({status: "error", user: FontFaceSetLoadEvent})
  //   }
  // })
});

// Login Controller with JWT implementation
app.post("/api/login", async (req, res) => {
  /**
    Users log in:
    Finds user by email
    Checks password matches
    Creates a secure token (JWT)
    Sends back token + basic user info
   */
  try {
    // Find user by email ...include password temporarily
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );

    // Check if user exists and passowrd matches
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({
        status: "error",
        message: "Wrong email or password",
      });
    }

    // Create JWT that expires in 1 hr containing user identity
    const token = jwt.sign(
      {
        id: user._id, // Put user ID in token
        email: user.email, // Put email in token
      },
      process.env.JWT_SECRET || 'fallback_development_secret', // Secret key ...should be in .env in real apps
      // { expiresIn: JWT_EXPIRES_IN}
      {expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
    );

    // Sending back token and user info( without password)
    res.json({
      status: "success",
      token, // Special key to prove who user is 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    // Create user response without password
    // const userResponse = user.toObject();
    // delete userResponse.password;
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
});

// GET all quotes
app.get('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const quotes = await Quote.find().populate('author', 'name email');
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new quote
app.post('/api/quotes', authenticateToken, async (req, res) => {
  try {
    const quote = new Quote({
      text: req.body.text,
      author: req.user.id // From the authenticated token
    });
    await quote.save();
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a quote
app.post('/api/quotes/:id/like', authenticateToken, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // Increment likes by 1
      { new: true }
    ).populate('author', 'name');
    
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





// JWT Protected Route

// app.get('/api/protected-data', authenticateToken, (req, res) => {
//   /*
//     Protectecting the routes:
//     Add authenticateToken as a middleware
//     Only people with valid tokens can access
//   */
//   res.json({ 
//     message: "This is secret data!", 
//     yourInfo: req.user 
//   });
// });

// Server Start
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
