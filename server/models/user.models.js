const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); // Required for password hashing
const SALT_ROUNDS = 10; // Security parameter (10-12)

// const User = new mongoose.Schema({
//     name: {type: String, required: true},
//     email: {type: String, required: true},
//     password: {type: String, required: true},
    //    quote: {type: String}
// },
// { collection: "user-data"}
//)

// const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false
  },
  // NEW: Array to store multiple quotes with timestamps
  quotes: [{
    text: {
      type: String,
      required: [true, "Quote text is required"],
      maxlength: [500, "Quote cannot exceed 500 characters"]
    },
    date: {
      type: Date,
      default: Date.now // Automatically records when quote was added
    },
    mood: {
      type: String,
      enum: ["happy", "inspired", "reflective", "motivated", "other"],
      default: "other"
    }
  }],
  // Rest of your existing fields...
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(el) { return el === this.password },
      message: "Passwords don't match!"
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, "Please enter a valid phone number"]
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    lowercase: true
  },
  agreeToTerms: {
    type: Boolean,
    required: [true, "You must agree to the terms"],
    validate: {
      validator: function(el) { return el === true },
      message: "You must accept the terms and conditions"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: "user-data" }); // Your custom collection name

// Middleware remains the same ...Password hashing
// UserSchema.pre('save', function(next) {
//   this.confirmPassword = undefined;
//   next();
// });
UserSchema.pre('save', async function(next) {
  // Only hash password if modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with 10 salt rounds
    this.password = await bcrypt.hash(this.password, 10);
    
    // Clear confirmPassword ...already validated
    this.confirmPassword = undefined;
    next();
  } catch (err) {
    return next(err);
  }
});

// Instnce Method ... Password Comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", UserSchema);