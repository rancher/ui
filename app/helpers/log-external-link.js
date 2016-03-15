import Ember from 'ember';

const VALIDSOURCES = ['container', 'instance', 'environment', 'host', 'service'];

export function logExternalLink(resource /*, hash*/ ) {
  resource = resource[0];
  let type = resource.resourceType;
  let out = `<a href="#" title=${resource.resourceType}>${resource.resourceType}:${resource.resourceId} <i class="icon icon-external-link"></i></a>`;
  if (VALIDSOURCES.indexOf(type) < 0) {
    out = `<span title=${resource.resourceType}>${resource.resourceType}:${resource.resourceId}</span>`;
  }
  return Ember.String.htmlSafe(out);
}

export default Ember.Helper.helper(logExternalLink);
