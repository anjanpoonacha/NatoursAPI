const catchAsync = require('./../utils/catchAsync');
const User = require('../model/userModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'SUCCESS',
    data: {
      user: updatedUser
    }
  });
});

// exports.getMe=;

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'SUCCESS',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `This route is not implemented, Use Sign Up instead.`
  });
};

exports.getAllUsers = factory.getAll(User);
// Do not update the password here
exports.getUser = factory.getOne(User); // Admin
exports.updateUser = factory.updateOne(User); // Admin
exports.deleteUser = factory.deleteOne(User);
