const mongoose = require('mongoose');
const Tour = require('./../model/tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.find().populate({ path: 'user', select: 'name photo' });
  // .populate({ path: 'tour', select: 'name' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this point to the current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRating
  });
};

reviewSchema.post('save', function(doc) {
  doc.constructor.calcAverageRatings(doc.tour);
});

reviewSchema.pre(/^findByIdAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findByIdAnd/, async function() {
  // await this.findOne() does NOT work here
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
