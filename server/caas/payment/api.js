module.exports = function(app/*, options*/) {
  const bodyParser = require('body-parser');
  const config = require('../../../config/environment')().APP;
  const stripe = require('stripe')('sk_test_QweblcKcSrTBP2Z9UkzFHyDU');
  const request = require('request');

  const rancherApiUrl = `${config.apiServer}${config.apiEndpoint}`;

  const newRequest = require('../../util/util.js').newRequest;
  const generateError = require('../../util/util.js').generateError;

  app.use(bodyParser.json()); // for parsing application/json


  app.use('/customer', function(req, res) {
    var card = req.body.card;
    var planId = req.body.subscription.id;
    var account = req.body.account;

    getUserEmail(account.id, res, (err, email) => {
      if (err) return generateError('account', 'No email found ', res);

      stripe.customers.create({
        source: card.token,
        email: email
      }, function(err, customer) {
        if (err) return generateError('subscription', err, res);

        addCustomerToAccount(account.id, customer.id, (err, account) => {
          if (err) return generateError('subscription', err, res);

          stripe.subscriptions.create({
            customer: customer.id,
            plan: planId
          }, function(err, subscription) {
            if (err) {
              return generateError('subscription', err, res);
            }
            // return res.status(200).json({type: 'success', message: 'found email', customer: customer, account: account, subscription: subscription});
            return res.status(200).json({type: 'success', message: 'subscription activated'});
          });
        });
      });
    });
  });

  app.use('/account-info', function(req, res) {
    var type = req.query.type;
    var stripeId = req.query.accountId;

    if (type === 'stripe') {

      stripe.customers.retrieve(
        stripeId,
        function(err, customer) {

          if (err) return generateError('db', err, res);

          let model = [];

          if (!customer.deleted && customer.sources.data.length) {

            customer.sources.data.forEach((card) => {
              model.push({brand: card.brand, id: card.id, last4: card.last4, name: card.name, expiry: `${card.exp_month}/${card.exp_year}`});
            });

            return res.status(200).json(model);
          } else {

            return generateError('db', err, res);
          }
        }
      );
    }
  });

  function addCustomerToAccount(accountId, stripeAccountId, cb) {
    // right now we'll be adding this to description field but that wont be perm and will need to change whent he field is added to cattle
    var url = `${rancherApiUrl}/accounts/${accountId}`;
    newRequest({
      url: url,
      method: 'PUT',
      body: {
        description: JSON.stringify({stripeAccountId: stripeAccountId}) // this will get its own field
      }
    }, function(body, response) {
      if (!body || !body.data) {
        return cb(body, null);
      }
      return cb(null, body.data);
    });
  }

  function getUserEmail(id, res, cb) {

    var url = `${rancherApiUrl}/passwords?accountId=${encodeURIComponent(id)}`;
    newRequest({
      url: url,
      method: 'GET',
    }, function(body, response) {
      if (!body || !body.data || !body.data.length ) {
        return cb(response, null);
      }
      return cb(null, body.data[0].publicValue);
    });
  }

    // newRequest({
    //   url: url,
    //   method: 'GET',
    // }, function(body) {
    //   if (!body || !body.data || !body.data.length ) {
    //     return generateError('account', 'No password found ', res);
    //   }
    // });
};
