import Ember from 'ember';

export function dateCalendar(params) {
  return moment(params[0]).calendar();
}

export default Ember.Helper.helper(dateCalendar);
