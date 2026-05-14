const mongoose = require('mongoose');

const validatePassword = (password) => {
  // Password must contain at least one number
  if (!/\d/.test(password)) {
    return false;
  }
  // Password must contain at least one special character
  if (!/[!@#$%^&*\-_.+=]/.test(password)) {
    return false;
  }
  return true;
};

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      validate: {
        validator: validatePassword,
        message: 'Password must contain at least one number and one special character (!@#$%^&*-_.+=)',
      },
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
