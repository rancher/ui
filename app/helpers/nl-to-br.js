import Ember from 'ember';

export function nlToBr(input) {
  var val = Ember.Handlebars.Utils.escapeExpression(input||'');
  return new Ember.Handlebars.SafeString(val.replace(/\n/g,'<br/>\n'));
}

export default Ember.Handlebars.makeBoundHelper(nlToBr);
