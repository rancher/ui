import Ember from 'ember';

export function dateStr(input, options) {
  var format = 'MMM DD, YYYY hh:mm:ss A';
  if ( options && options.hash && options.hash.format )
  {
    format = options.hash.format;
  }

  return moment(input).format(format);
}

export default Ember.Handlebars.makeBoundHelper(dateStr);
