import Ember from 'ember';

export function runTime(params) {
  var s = moment(params[0]);
  var e = moment(params[1]);
  var time =  e.diff(s)/1000;
  if ( time )
  {
    return `${time} sec`;
  }
  else
  {
    return '<span class="text-muted">-</span>'.htmlSafe();
  }
}

export default Ember.Helper.helper(runTime);
