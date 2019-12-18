const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
// const User = require('./../model/userModel');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/forgotPassword', authController.forgotPassword);

// router.patch('/reActivate', async (req, res, next) => {
//   try {
//     const updatedUser = await User.aggregate([
//       {
//         $match: {
//           active: false
//         }
//       }
//     ]);

//     res.json(updatedUser);
//   } catch (err) {
//     console.log(err);
//     res.json({ no: 'no' });
//   }
// });

// The following Middleware is now protected by this line of code
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// These Middlewares should only be executed by admins

router.use(authController.restrictTo('admin'));
router
  .route(`/`)
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
