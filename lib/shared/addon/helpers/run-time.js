import Ember from 'ember';

export function runTime(params) {
  var s = moment(params[0]);
  var e = moment(params[1]);
  var time =  Math.round(e.diff(s)/100)/10;
  if ( time )
  {
    if ( time > 60 )
    {
      time = Math.round(time);
    }

    return `${time} sec`;
  }
  else
  {
    return '<span class="text-muted">-</span>'.htmlSafe();
  }
}

export default Ember.Helper.helper(runTime);
