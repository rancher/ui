import Ember from 'ember';

var esc = Ember.Handlebars.Utils.escapeExpression;

export function displayImage(params) {
  var input = params[0];
  var match = (input||'').match(/(docker:)?(.*\/)?(.*?)(:.*)?$/);
  if ( !match )
  {
    return input;
  }

  var out = (match[2] ? '<span class="text-muted">' + esc(match[2]) + '</span>' : '') +
            esc(match[3]) +
            (match[4] ? '<span class="text-muted">' + esc(match[4]) + '</span>' : '');

  return new Ember.Handlebars.SafeString(out);
}

export default Ember.Helper.helper(displayImage);
