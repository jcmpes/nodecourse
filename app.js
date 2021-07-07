var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const loginController = require('./controllers/loginController');
const cors = require('cors');
const registerController = require('./controllers/registerController');
const verifyController = require('./controllers/verifyController');
const forgotPasswordController = require('./controllers/forgotPasswordController');
const resetPasswordController = require('./controllers/resetPasswordController');

// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API
app.post('/api/v1/register', registerController.register);
app.post('/api/v1/verify', verifyController.verify);
app.post('/api/v1/loginJWT', loginController.postJWT);
app.post('/api/v1/forgot', forgotPasswordController.forgot);
app.post('/api/v1/reset', resetPasswordController.reset);

//app.use('/api/v1/courses', require('./routes/api/courses'));

//app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  if (isAPIRequest(req)) {
    res.json({ error: err.message });
    return;
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

function isAPIRequest(req) {
  return req.originalUrl.indexOf('/api/') === 0;
}

module.exports = app;
