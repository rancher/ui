import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';
import Ember from 'ember';

export function nlToBr(params) {
  var val = Ember.Handlebars.Utils.escapeExpression(params[0] || '');

  return new htmlSafe(val.replace(/\n/g, '<br/>\n'));
}

export default helper(nlToBr);
