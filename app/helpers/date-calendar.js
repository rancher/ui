import Ember from 'ember';

export function dateCalendar(input) {
  return moment(input).calendar();
}

export default Ember.Handlebars.makeBoundHelper(dateCalendar);
