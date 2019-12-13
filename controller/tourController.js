const Tour = require('./../model/tourModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

// const AppError = require('./../utils/appError');
// const APIFeatures = require('./../utils/apiFeatures');

/* -------------------- ALIASING ------------------- */

exports.aliasTopTours = (req, res, next) => {
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query.sort = '-ratingsAverage price';
  req.fields = 'name,price,duration,difficulty,summary';

  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 }
      }
    },
    {
      $sort: { avgRatings: -1 }
      // },
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' }
      //   }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $sort: { numTours: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    numTours: plan.length,
    year,
    data: {
      plan
    }
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   /* const newTour = new Tour({})
//   newTour.save().then().catch() */

//

/* const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
      );
      */

//

/* exports.checkBody = (req, res, next) => {
       if (!req.body.name || !req.body.price) {
         return res.status(400).json({
           status: 'fail',
           message: 'Cannot find Price or Name'
          });
        }
        next();
      }; */

//

/* exports.checkID = (req, res, next, val) => {
        if (val * 1 > tours.length) {
          return res
          .status(404)
          .json({ status: 'fail', message: 'Cannot find the ID' });
        }
        
        next();
      }; */
