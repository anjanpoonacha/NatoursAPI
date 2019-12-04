const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      maxlength: [40, 'A tour name must have less than 40 characters'],
      minlength: [10, 'A tour name must have less than 10 characters']
      // validate: [validator.isAlpha, 'message']
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "difficulty should be either 'easy', 'medium' or 'difficult' "
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour ratingsAverage should be above 1'],
      max: [5, 'A tour ratingsAverage should be below 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // 'this' points to current document only on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below actual price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
      // ,select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
/* --------PRE SAVE HOOK------ */
tourSchema.pre('save', function() {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true }); // ADD SLUG IN THE SCHEMA
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); //  ADD secretTour IN THE SCHEMA
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  console.log(`Query is executed in ${Date.now() - this.start}`);
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

// eslint-disable-next-line new-cap
const Tour = new mongoose.model(`Tour`, tourSchema);

module.exports = Tour;

// tourSchema.pre('save', function(next) {
//   console.log(`POST SAVE HOOK`);
//   next();
// });

// /* --------POST SAVE HOOK------ */
// tourSchema.post('save', function(doc, next) {
//   console.log(`POST SAVE HOOK`);
//   next();
// });
