import Ember from 'ember';

export function ucFirst(input) {
  input = input||'';
  return input.substr(0,1).toUpperCase() + input.substr(1);
}

export default Ember.Handlebars.makeBoundHelper(ucFirst);
