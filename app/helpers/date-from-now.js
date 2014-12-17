import Ember from 'ember';

export function dateFromNow(input) {
  return moment(input).fromNow();
}

export default Ember.Handlebars.makeBoundHelper(dateFromNow);
