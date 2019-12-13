const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'SUCCESS',
    numReviews: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'SUCCESS',
    data: {
      review
    }
  });
});
