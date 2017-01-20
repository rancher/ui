import Ember from 'ember';

export function dateCalendar(params, options) {
  let out = moment(params[0]).calendar();
  if ( options && options.withToday !== true  ) {
    out = out.replace('Today at ','');
  }

  return out;
}

export default Ember.Helper.helper(dateCalendar);
