import Ember from 'ember';

export default Ember.Component.extend({
  ip: null,
  noIp: 'formatIp.noIp',
  showCopy: false,

  tagName: '',

  displayIp: function() {
    let ip = this.get('ip');
    // @TODO real IPv6 shortening
    if ( ip === '0:0:0:0:0:0:0:1' ) {
      return '::1';
    }

    return ip;
  }.property('ip'),
});
