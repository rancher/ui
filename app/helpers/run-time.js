import Ember from 'ember';

export function runTime(startTime, endTime) {
  var s = moment(startTime);
  var e = moment(endTime);
  var time =  e.diff(s);
  return `${time}ms`;
}

export default Ember.Handlebars.makeBoundHelper(runTime);
