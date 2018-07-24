// To use it create some files under `routes/`
// e.g. `server/routes/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };
/* eslint-env node */
module.exports = function(app, options) {
  var dotenv      = require('dotenv').config(); // eslint-disable-line
  var globSync    = require('glob').sync;
  var mocks       = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  var proxies     = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);


  mocks.forEach(function(route) { route(app, options); });
  proxies.forEach(function(route) { route(app, options); });
};
