module.exports = function(app/*, options*/) {
  var bodyParser = require('body-parser');
  var config = require('../../../config/environment')().APP;
  var request = require('request');

  var rancherApiUrl = `${config.apiServer}${config.apiEndpoint}`;
  var tablePrefix = process.env.DB_TABLE_PREFIX || '';

  app.use(bodyParser.json()); // for parsing application/json


  app.use('/customer', function(req, res) {
  });


};
