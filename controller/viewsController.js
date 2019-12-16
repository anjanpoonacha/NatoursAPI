const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) GET ALL THE DATA FROM DB
  // 2) BUILD THE TEMPLATE
  // 3) RENDER THE TEMPLATE USING TOUR DATA

  // 1
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The forest Hiker Tour'
  });
};
