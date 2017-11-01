import Ember from 'ember';
import urlRegex from 'npm:url-regex';

function convertToLink(match) {
  let url;
  let displayUrl = match.trim();
  if (displayUrl.startsWith('https://') ||
    displayUrl.startsWith('http://') ||
    displayUrl.startsWith('//')) {
    url = displayUrl;
  } else {
    url = `//${displayUrl}`;
  }
  return `<a href="${url}" target="_blank">${displayUrl}</a>`
}

export function linkify(params) {
  let content = Ember.Handlebars.Utils.escapeExpression(params[0] || '');
  content = content.replace(urlRegex({ strict: false }), convertToLink);
  return Ember.String.htmlSafe(content);
}

export default Ember.Helper.helper(linkify);
