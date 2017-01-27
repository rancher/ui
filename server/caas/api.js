module.exports = function(app, options) {
  var path = require('path');
  var bodyParser = require('body-parser');
  var mysql      = require('mysql');
  var config = require('../../config/environment')().APP;
  var request = require('request');

  var helper = require('sendgrid').mail;
  var crypto = require('crypto');

  var rancherApiUrl = `${config.apiServer}${config.apiEndpoint}`;
  var tablePrefix = process.env.DB_TABLE_PREFIX || '';

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
    generic: {
      message: 'Internal Server Error',
      status: 500,
      type: 'error',
      detail: 'Internal Server Error'
    },
    token: {
      message: 'Internal Server Error',
      status: 500,
      type: 'error',
      detail: 'There was an error trying to retrieve that token, try again later'
    },
  };

  app.use(bodyParser.json()); // for parsing application/json

  var pool = mysql.createPool({
    host     : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
  });

  app.use('/register-new', function(req, res, next) {
    generateAndInsertToken(null, req.body.name, req.body.email, "create", function(error, results, fields, token) {
      if (error) {
        generateError('auth', error, res);
      } else {
        sendVerificationEmail(req.body.email, req.body.name, req.headers.origin, token, function(error, resp) {
          if (error) {
            generateError('email', error, res);
          } else {
            res.status(200).json();
          }
        });
      }
    });
  });


  app.use('/verify-token', function(req, res, next) {
    getChallengeToken(req.body.token, function(error, results, fields) {
      if (error) {
        generateError('token', error, res);
      } else {
        if (results.length) {
          var row = results[0];
          var out = {
            email: row.email,
            name: row.name,
          };
          res.status(200).send(out);
        } else {
          generateError('token', error, res);
        }
      }
    });
  });

  app.use('/create-user', function(req, res, next) {
    var user = req.body;
    // {kind: "user", type: "account", name: "wes"}
    var account = {
      type: 'user',
      name: user.name
    };
    // {type: "password", publicValue: "wes1@rancher.com", secretValue: "asdf", accountId: "1a28"}
    var credential = {
      type: 'password',
      publicValue: user.email,
      secretValue: user.pw,
      accountId: null
    };

    getChallengeToken(user.token, function(error, results, fields) {
      if (error) {
        generateError('token', error, res);
      } else {
        if (results.length) {
          var accountModel = null;
          var credentialModel = null;
          newRequest({
            url: `${rancherApiUrl}/account`,
            method: 'POST',
            body: account
          }, function(response, body) {

            accountModel = body;
            credential.accountId = body.id;

            newRequest({
              url: `${rancherApiUrl}/passwords`,
              method: 'POST',
              body: credential
            }, function(response, body) {
              credentialModel = body;
              removeUserFromTable(user.email, function(results, fields) {
                getTokenForLogin(user.email, user.pw, function(response, body) {
                  var opts = {};
                  if (req.secure) {
                    opts.secure = true;
                  }
                  res.cookie('token', body.jwt, opts).status(200).send({type: 'success'});
                });
              }, res);
            }, res);
          }, res);
        } else {
          generateError('token', error, res);
        }
      }
    });
  });

  app.use('/reset-password', function(req, res, next) {
    var user = req.body;
    var userEmail = user.email;
    var name = user.name;
    var url = `${rancherApiUrl}/credentials?kind=password&publicValue=${userEmail}&limit=-1&sort=name`;

    if (user.email) {
      newRequest({
        url: url,
        method: 'GET',
      }, function(response, body) {

        if (body.data && body.data.length) {

          var credential = body.data[0];
          var credId = credential.id;
          var url = `${rancherApiUrl}/accounts/${credential.accountId}`;
          var credEmail = credential.publicValue;

          newRequest({
            url: url,
            method: 'GET'
          }, function(response, body) {

            if (body.type === 'account') {
              generateAndInsertToken(body.id, name, credEmail, "reset", function(error, results, fields, token) {
                if (error) {
                  generateError('token', error, res);
                } else {

                  sendPasswordReset(req.body.email, response.body.name, req.headers.origin, token, function(error, resp) {
                    if (error) {
                      generateError('email', error, res);
                    } else {
                      res.status(200).json({success: 'Email sent'});
                    }
                  });
                }
              });
            } else {
              generateError('account', error, res);
            }
          });
        } else {
          generateError('account', error, res);
        }
      });
    } else {
      generateError('account', error, res);
    }
  });

  app.use('/update-password', function(req, res, next) {
    var user = req.body;

    getChallengeToken(user.token, function(error, results, fields) {
      if (error) generateError('token', error, res);;

      if (results.length) {
        var credential = results[0];

        if (credential.email) {
          newRequest({
            url: `${rancherApiUrl}/passwords?publicValue=${credential.email}`,
            method: 'GET'
          }, function(response, body) {

            if (body.data && body.data.length) {
              newRequest({
                url: `${rancherApiUrl}/passwords/${body.data[0].id}?action=changesecret`,
                method: 'POST',
                body: {newSecret: user.pw, oldSecret: ''}
              }, function(response, body) {
                removeUserFromTable(credential.email, function(results, fields) {
                  getTokenForLogin(credential.email, user.pw, function(response, body) {
                    sendPasswordVerificationEmail(credential.email, credential.name, req.headers.origin, function(error, resp) {
                      if (error) {
                        generateError('email', error, res);
                      } else {
                        var opts = {};
                        if (req.secure) {
                          opts.secure = true;
                        }
                        res.cookie('token', body.jwt, opts).status(200).send({type: 'success'});
                      }
                    });
                  }, res);
                });
              }, res);
            }
          });
        } else {
          generateError('account', error, res);
        }

      } else {

        generateError('token', error, res);
      }
    });
  });

  function generateAndInsertToken(id, name, email, request, cb) {
    var challengeToken = crypto.randomBytes(20);
    challengeToken = challengeToken.toString('hex');
    return pool.query(`INSERT INTO ${tablePrefix}challenge SET account_id = ?, name = ?, email = ?, token = ?, request = ?, created = NOW()`, [id, name, email, challengeToken, request], function(error, results, fields) {
      cb(error, results, fields, challengeToken);
    });
  };

  function getTokenForLogin(username, password, cb, ogRes) {
    return request({
      method: 'POST',
      json: true,
      url: `${rancherApiUrl}/token`,
      body: {
        code: `${username}:${password}`
      }
    }, function(error, response, body) {
      if (error) console.log('getTokenForLogin error: ', error);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        cb(response, body);
      } else {
        var errOut = null;
        if (error) {
          errOut = error;
        } else {
          errOut = response;
        }
        // cattle error just pass it along
        ogRes.status(body.status).send(body);
      }
    });
  };
  // opts should only contain url, method and data
  function newRequest(opts, cb, ogRes) {
    var optsOut = {
      auth: {
        user: process.env.CATTLE_ACCESS_KEY,
        pass: process.env.CATTLE_SECRET_KEY,
      },
      json: true,
    };

    Object.assign(optsOut, opts);

    encodeURIComponent(optsOut.url);
    return request(optsOut, function(error, response, body) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        cb(response, body);
      } else {
        var errOut = null;
        if (error) {
          errOut = error;
        } else {
          errOut = response;
        }
        console.log('error:', errOut);
        if (ogRes) {
          generateError('account', error, ogRes);
        }
      }
    });
  }

  function removeUserFromTable(email, cb) {
    return pool.query(`DELETE FROM ${tablePrefix}challenge WHERE email = ? OR created > DATE_SUB(NOW(), INTERVAL 24 HOUR)`, [email], function(error, results, fields){
      if (error) console.log('error', 'could not delete records');
      cb(results, fields);
    });
  }

  function getChallengeToken(token, cb) {
    return pool.query(`SELECT * FROM ${tablePrefix}challenge WHERE token = ? AND created > DATE_SUB(NOW(), INTERVAL 24 HOUR)`, [token], function(error, results, fields) {
      if (error) console.log('error', 'could not retrieve token');
      cb(error, results, fields);
    });
  }

  function fetchSendGridApiDetails(detail, cb) {
    var url = `${rancherApiUrl}/settings/`;

    return newRequest({
      url: `${url}ui.sendgrid.api_key`,
      method: 'GET',
    }, function(response, body) {

      if (body) {
        var apiKey = body.activeValue;

        return newRequest({
          url: `${url}${detail}`,
          method: 'GET'
        }, function(response, body) {

          if (body) {
            cb({apiKey: apiKey, id: body.activeValue});
          } else {
            cb(false);
          }
        }, null);

      } else {

        cb(false);
      }
    });
  }

  function sendPasswordReset(email, name, host, token, cb) {
    fetchSendGridApiDetails('ui.sendgrid.template.password_reset', function(response) {
      if (response) {
        var apiKey = response.apiKey;
        var templateId = response.id;
        var from_email = new helper.Email('no-reply@rancher.com');
        var to_email = new helper.Email(email);
        var subject = 'Password Reset Request';
        var contentLink = `<html><a href="${host}/verify-reset-password/${token}">Reset Password</a></html>`;
        var content = new helper.Content(
          'text/html', contentLink);
        var mail = new helper.Mail(from_email, subject, to_email, content);
        mail.personalizations[0].addSubstitution(
          new helper.Substitution("-username-", name));
        mail.setTemplateId(templateId);

        var sg = require('sendgrid')(apiKey);
        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON(),
        });

        return sg.API(request, cb);
      } else {
        cb('There was a problem retrieving the email api key or email template id.', null);
      }
    });
  }

  function sendVerificationEmail(email, name, host, token, cb) {
    fetchSendGridApiDetails('ui.sendgrid.template.create_user', function(response) {
      if (response) {
        var from_email = new helper.Email('no-reply@rancher.com');
        var to_email = new helper.Email(email);
        var subject = 'Verify your Rancher Cloud Account';
        var contentLink = `<html><a href="${host}/verify/${token}">Verify Email</a></html>`;
        var content = new helper.Content(
          'text/html', contentLink);
        var mail = new helper.Mail(from_email, subject, to_email, content);
        mail.setTemplateId(process.env.CREATE_USER_TEMPLATE_ID);

        var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON(),
        });

        return sg.API(request, cb);
      } else {
        cb('There was a problem retrieving the email api key or email template id.', null);
      }
    });
  }

  function sendPasswordVerificationEmail(email, name, host, cb) {
    fetchSendGridApiDetails('ui.sendgrid.template.verify_password', function(response) {
      if (response) {
        var from_email = new helper.Email('no-reply@rancher.com');
        var to_email = new helper.Email(email);
        var subject = 'Password Reset Confirmation';
        var contentLink = `<html><a href="${host}/login?resetpw=true">Reset Password</a></html>`;
        var content = new helper.Content(
          'text/html', contentLink);
        var mail = new helper.Mail(from_email, subject, to_email, content);
        mail.setTemplateId(process.env.PASSWORD_VERIFY_RESET_TEMPLATE_ID);

        var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON(),
        });

        return sg.API(request, cb);
      } else {
        cb('There was a problem retrieving the email api key or email template id.', null);
      }
    });

  }
  function generateError(code, error, response) {
    // eventually put real error log in this function
    console.log('Error Generator: ', error);
    var err = ERRORS[code];
    return response.status(err.status).send(err);
  }
};
