import Ember from 'ember';

export function runTime(params) {
  var s = moment(params[0]);
  var e = moment(params[1]);
  var time =  e.diff(s);
  return `${time}ms`;
}

export default Ember.Helper.helper(runTime);
