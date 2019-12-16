const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

// SETTING UP PUG ENGINE
app.set('view engine', 'pug');

//  DEFINING THE LOCATION OF THE 'VIEWS' FOLDER
app.set('views', path.join(__dirname, 'views'));

// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1) GLOBAL MIDDLEWARE

// SET SECURITY HEADER
app.use(helmet());

// DEVELOPMENT LOGGING MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUEST FROM SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// BODY PARSER
app.use(express.json({ limit: '10kb' }));

// DATA SANITIZE AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

// DATE SANITIZE AGAINT XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toUTCString();
  // console.log(req.headers);
  next();
});

app.use(`/`, viewRouter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'FAIL';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
