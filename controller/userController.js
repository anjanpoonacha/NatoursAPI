const catchAsync = require('./../utils/catchAsync');
const User = require('../model/userModel');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'SUCCESS',
    numResults: users.length,
    data: {
      users
    }
  });
});

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
    message: `This route is not implemented yet`
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `This route is not implemented yet`
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `This route is not implemented yet`
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: `error`,
    message: `This route is not implemented yet`
  });
};
