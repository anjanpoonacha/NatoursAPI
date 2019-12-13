const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
// const User = require('./../model/userModel');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

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

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

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
