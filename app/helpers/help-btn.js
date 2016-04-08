import Ember from 'ember';
import C from 'ui/utils/constants';

export function domId(params) {
  var link = params[0];
  var title = params[1] || "Go to documentation page";
  return ` <a href="${C.EXT_REFERENCES.DOCS}${link}" target="_blank" title="${title}" class="small"><i class="icon icon-help"/></a>`.htmlSafe();
}

export default Ember.Helper.helper(domId);