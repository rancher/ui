import Ember from 'ember';

export function lowerCase(value) {
  return (value||'').toLowerCase();
}

export default Ember.Handlebars.makeBoundHelper(lowerCase);
