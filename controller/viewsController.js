const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 1) GET ALL THE DATA FROM DB
// 2) BUILD THE TEMPLATE
// 3) RENDER THE TEMPLATE USING TOUR DATA
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review, rating, user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: `Login`
  });
});

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
});

exports.getUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  console.log(req.body);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user
  });
});
