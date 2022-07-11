const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mongoose = require('mongoose');

const { DATABASE_URI, CORS_DOMAIN } = require('./config/constants');

const credentialRouter = require('./routes/credentials');
const dictionaryRouter = require('./routes/dictionary');
const apikeyRouter = require('./routes/apikeys');

const CORS_OPTIONS = {
  origin: CORS_DOMAIN,
};

const app = express();

mongoose.connect(DATABASE_URI, { useNewUrlParser: true , useUnifiedTopology: true})
  .then(() => {
    console.log('connected to mongodb');
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Swagger configuration
const options = {
  definition: {
    swagger: "2.0",
    info: {
      title: "Defaultinator API",
      version: "0.1",
      description:
        "This API is a lookup service for default credentials.",
      contact: {
        name: "Rapid7",
        url: "https://rapid7.com",
        email: "admin@defaultinator.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
    components: {},
  },
  apis: [
    "./routes/*.js",
    "./models/*.js",
    "./middleware/*.js",
  ],
};

const specs = swaggerJsdoc(options);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.use(cors(CORS_OPTIONS));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/credentials', credentialRouter);
app.use('/dictionary', dictionaryRouter);
app.use('/apikeys', apikeyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Full stack traces of all errors. Theses should go somewhere better.
  if(err?.status >= 400 && err?.status <= 599) {
    console.error(err)
  }

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
