const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

/* -------------------- ALIASING ------------------- */

exports.aliasTopTours = (req, res, next) => {
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  req.query.sort = '-ratingsAverage price';
  req.fields = 'name,price,duration,difficulty,summary';

  next();
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      message: `${err}`
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE THE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // const tours = await Tour.find(queryObj);
    // const tours = await Tour.find().where().equals().where().equals();

    res.status(200).json({
      requestedAt: req.requestTime,
      status: 200,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

exports.createTour = async (req, res) => {
  /* const newTour = new Tour({})
  newTour.save().then().catch() */
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).send({
      status: 'success',
      body: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `${err}`
    });
  }
};

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

//
