import Resource from 'ember-api-store/models/resource';

var VolumeSpec = Resource.extend({
  type: 'volumeSpec',
  source: null,
  dest: null,
  opt: null,

  isBindMount: function() {
    return (this.get('source')||'').substr(0,1) === '/';
  }.property('source'),

  optArray: function() {
    return (this.get('opt')||'').split(',');
  }.property('opt'),

  isWritable: function() {
    return !this.get('optArray').includes('ro');
  }.property('optArray'),

});

export default VolumeSpec;
