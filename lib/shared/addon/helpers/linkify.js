import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';
import Ember from 'ember';
import linkifyStr from 'linkifyjs/string';

const MAX_LENGTH = 1000;

export function linkify(params) {
  let content = params[0] || '';

  if ( content.length > MAX_LENGTH ) {
    return content;
  }

  content = Ember.Handlebars.Utils.escapeExpression(content);

  content = linkifyStr(content, {
    attributes:      { rel: 'nofollow noreferrer' },
    defaultProtocol: 'https'
  });

  return htmlSafe(content);
}

export default helper(linkify);
