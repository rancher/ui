/* eslint-env node */
module.exports = function(app/*, options*/) {
  const bodyParser = require('body-parser');
  const config = require('../../../config/environment')().APP;
  const stripe = require('stripe')(process.env.STRIPE_TOKEN);

  const rancherApiUrl = `${config.apiServer}${config.apiEndpoint}`;

  const newRequest = require('../../util/util.js').newRequest;
  const generateError = require('../../util/util.js').generateError;

  app.use(bodyParser.json()); // for parsing application/json


  app.use('/payment', function(req, res) {
    switch (req.method) {
      case 'DELETE':
        stripe.customers.deleteCard(
          req.body.customerId,
          req.body.cardId,
          function(err, confirmation) {
            if (err) return generateError('payment', err, res);
            return res.status(200).json({type: 'success', status: 200, message: confirmation});
          }
        );
        break;
      case 'POST':
        var card = req.body.card;
        var planId = req.body.subscription.id;
        var account = req.body.account;

        getUserEmail(account.id, res, (err, email) => {
          if (err) return generateError('account', 'No email found ', res);

          // need to do something with the stripe id here, if they have an account already what do we do?
          stripe.customers.create({
            source: card.token,
            email: email
          }, function(err, customer) {
            if (err) return generateError('subscription', err, res);

            addCustomerToAccount(account.id, customer.id, (err/* , account */) => {
              if (err) return generateError('subscription', err, res);

              stripe.subscriptions.create({
                customer: customer.id,
                plan: planId
              }, function(err/* , subscription */) {
                if (err) {
                  return generateError('subscription', err, res);
                }
                return res.status(200).json({type: 'success', message: 'subscription activated'});
              });
            });
          });
        });
        break;
      case 'GET':
        var type = req.query.type;
        var stripeId = req.query.accountId;

        if (type === 'stripe') {

          stripe.customers.retrieve(
            stripeId,
            function(err, customer) {
              if (err) return generateError('subscription', 'stripe error', res);

              let model = [];

              if (customer.deleted) {
                return generateError('db', err, res);
              } else {
                customer.sources.data.forEach((card) => {
                  model.push({brand: card.brand, id: card.id, last4: card.last4, name: card.name, expiry: `${card.exp_month}/${card.exp_year}`});
                });

                return res.status(200).json(model);
              }
            }
          );
        }
        break;
      case 'PUT':
      default:
        return res.status(405).send();
    }
  });

  function addCustomerToAccount(accountId, stripeAccountId, cb) {
    // right now we'll be adding this to description field but that wont be perm and will need to change whent he field is added to cattle
    var url = `${rancherApiUrl}/accounts/${encodeURIComponent(accountId)}`;
    newRequest({
      url: url,
      method: 'PUT',
      body: {
        description: JSON.stringify({stripeAccountId: stripeAccountId}) // this will get its own field
      }
    }, function(body/* , response */) {
      if (!body || !body.data) {
        return cb(new Error('Could not add the stripe id to the account'));
      }
      return cb(null, body.data);
    });
  }

  function getUserEmail(id, res, cb) {

    var url = `${rancherApiUrl}/passwords?accountId=${encodeURIComponent(id)}`;
    newRequest({
      url: url,
      method: 'GET',
    }, function(body/* , response */) {
      if (!body || !body.data || !body.data.length ) {
        return cb(new Error('Could not get the users email'));
      }
      return cb(null, body.data[0].publicValue);
    });
  }

};
