var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const loginController = require('./controllers/loginController');
const registerController = require('./controllers/registerController');
const verifyController = require('./controllers/verifyController');
const deleteUserController = require('./controllers/deleteUserController');
const forgotPasswordController = require('./controllers/forgotPasswordController');
const resetPasswordController = require('./controllers/resetPasswordController');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//API GET
app.use('/api/v1/aboutme', require('./routes/apiv1/aboutme'));

// API POST
app.post('/api/v1/register', registerController.register);
app.get('/api/v1/verify', verifyController.verify);
app.post('/api/v1/loginJWT', loginController.postJWT);
app.post('/api/v1/login-with-token', loginController.loginWithToken);
app.post('/api/v1/forgot-password', forgotPasswordController.forgot);
app.post('/api/v1/reset-password', resetPasswordController.reset);
app.post('/api/v1/delete-user', deleteUserController.delete);

// API courses
app.use('/api/v1/courses', require('./routes/apiv1/courses'));

// API categories
app.use('/api/v1/categories', require('./routes/apiv1/categories'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.json({ error: err.message });
  return;
});

module.exports = app;
