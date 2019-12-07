const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'lead-guide', 'guide', 'user']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: `Passwords are not the same`
    }
  },
  passwordChanged: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // delete this.passwordConfirm; Doesn't work
  // console.log(this.passwordConfirm); // o/p is pass1234

  this.passwordConfirm = undefined;
});

userSchema.methods.passwordChangedAfter = async function(JWTTimeStamp) {
  if (this.passwordChanged) {
    const changedTimeStamp = this.passwordChanged.getTime() / 1000;

    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
