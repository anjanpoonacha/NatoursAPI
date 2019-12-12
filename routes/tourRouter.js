const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRouter');

const router = express.Router();

/* router.param('id', tourController.checkID); */

/* -------------ALIASING-------------- */

/* NESTING A ROUTER  */
// Rerouting / Mounting a router
router.use('/:tourId/reviews', reviewRouter); // For this to work add MERGEPARAMS option in router

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

module.exports = router;

/* NESTING A ROUTER  */
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
