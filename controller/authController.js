const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = catchAsync(async (user, statusCode, res) => {
  const token = await signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now(process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // REMOVE THE PASSWORD FROM THE OUTPUT

  user.password = undefined;
  res.status(statusCode).json({
    status: 'SUCCESS',
    token
  });
});

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

  createSendToken(newUser, 201, res);
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

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'));
  }

  // 3) If everything is OK, send token to client
  createSendToken(user, 200, res);
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
  // console.log(decoded);

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

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON POSTed EMAIL
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with the email address', 404));
  }

  // 2) GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) SEND TOKEN TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;

  const message = `Forgot Password? Submit PATCH request with your new password and passwordConfirm to ${resetURL}`;

  try {
    await sendEmail({
      email: user.email /*or req.email */,
      subject: `Your password reset token (Valid for 10 mins)`,
      message
    });
    res
      .status(200)
      .json({ status: `SUCCESS`, message: `Your token is sent via email!` });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was error trying to send an email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  // 2) If token has not expired, and there is user, set the new password
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT

  // 1
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // console.log(user.passwordResetExpires, Date.now());
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 500));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3 is taken care by the middleware
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  /**
   * Get the user from the collection
   * Check if POSTed currentPassword is correct
   * if so, update password
   * Log user in, send JWT
   */

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
