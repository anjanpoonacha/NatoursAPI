const catchAsync = require('./../utils/catchAsync');
const User = require('../model/userModel');

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
