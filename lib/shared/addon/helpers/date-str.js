import Ember from 'ember';

export function dateStr(params, options) {
  var format = 'MMM DD, YYYY hh:mm:ss A';
  if ( options && options.format )
  {
    format = options.format;
  }

  return moment(params[0]).format(format);
}

export default Ember.Helper.helper(dateStr);
