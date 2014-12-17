import Ember from 'ember';

export function upperCase(value) {
  return (value||'').toUpperCase();
}

export default Ember.Handlebars.makeBoundHelper(upperCase);
