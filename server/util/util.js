/* eslint-env node */
const ERRORS = {
  auth: {
    message: 'Unauthorized',
    status: 401,
    type: 'error',
    detail: 'Unauthorized'
  },
  account: {
    message: 'Unauthorized',
    status: 401,
    type: 'error',
    detail: 'There was an error trying to retrieve that account, ensure you have entered the correct credentials and try again later'
  },
  db: {
    message: 'Internal Server Error',
    status: 500,
    type: 'error',
    detail: 'There was an error retrieving your data, ensure the info you entered is correct and try again'
  },
  email: {
    message: 'Internal Server Error',
    status: 500,
    type: 'error',
    detail: 'There was an error with your email, ensure you have entered the correct email and try again'
  },
  exists: {
    message: 'Account Exists',
    status: 409,
    type: 'error',
    detail: 'That account exists already, please use the reset password tool or create a new account with a different email.'
  },
  generic: {
    message: 'Internal Server Error',
    status: 500,
    type: 'error',
    detail: 'Internal Server Error'
  },
  token: {
    message: 'Internal Server Error',
    status: 404,
    type: 'error',
    detail: 'There was an error trying to retrieve that token, try again later'
  },
  subscription: {
    message: 'Internal Server Error',
    status: 500,
    type: 'error',
    detail: 'There was an error trying to process your subscription, try again later'
  }
};
var generateError = function(code, detail, response) {
  // eventually put real error log in this function
  console.log('Error Generator: ', detail);
  var err = ERRORS[code];
  return response.status(err.status).send(err);
};
module.exports = {
  generateError: generateError, // i could not get this working quite like vince wanted, i'll come back later but for now it works

  newRequest: function(opts, cb, ogRes) {
    var request = require('request');
    var optsOut = {
      auth: {
        user: process.env.CATTLE_ACCESS_KEY,
        pass: process.env.CATTLE_SECRET_KEY,
      },
      json: true,
    };

    Object.assign(optsOut, opts);

    return request(optsOut, function(err, response, body) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return cb(body, response);
      }

      var errOut = null;
      if (err) {
        errOut = err;
      } else {
        errOut = response;
      }

      console.log('error:', errOut);
      if (ogRes) {
        generateError('account', err, ogRes);
      }
    });
  },
}
