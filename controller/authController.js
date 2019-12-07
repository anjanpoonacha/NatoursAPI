const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    passwordChanged,
    role
  } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChanged,
    role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'SUCCESS',
    token,
    data: {
      user: newUser
    }
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's there
  let token;
  const { headers } = req;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You must login first', 401));
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token longer exists', 401)
    );
  }

  // 4. Check if user changed password after the token was issued
  if (await currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'User changed the password recently. Please login again!',
        401
      )
    );
  }
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  // READ THE BODY DATA
  const { email, password } = req.body;
  //  1) Check if email and passwod exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);
  // compare 'pass1234'==='$2a$12$5Rbl0wk0kvtNUrA4hvuiceHWjWzGV5CgG9o1IcBNXJOJQPMiuDDH.';

  if (!email || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'));
  }

  // 3) If everything is OK, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'SUCCESS',
    token
  });
});
