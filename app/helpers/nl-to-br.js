import Ember from 'ember';

export function nlToBr(params) {
  var val = Ember.Handlebars.Utils.escapeExpression(params[0]||'');
  return new Ember.String.htmlSafe(val.replace(/\n/g,'<br/>\n'));
}

export default Ember.Helper.helper(nlToBr);
