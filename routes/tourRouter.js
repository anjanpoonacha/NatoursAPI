const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');

const router = express.Router();

/* router.param('id', tourController.checkID); */

/* -------------ALIASING-------------- */
router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

module.exports = router;
