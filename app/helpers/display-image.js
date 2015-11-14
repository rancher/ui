import Ember from 'ember';

var esc = Ember.Handlebars.Utils.escapeExpression;

export function displayImage(params) {
  var match = (params[0]||'').match(/(docker:)?(.*\/)?(.*?)(:.*)?$/);
  if ( !match )
  {
    return params[0];
  }

  var out = (match[2] ? '<span>' + esc(match[2]) + '</span>' : '') +
            esc(match[3]) +
            (match[4] ? '<span>' + esc(match[4]) + '</span>' : '');

  return new Ember.Handlebars.SafeString(out);
}

export default Ember.Helper.helper(displayImage);
