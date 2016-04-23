import Ember from 'ember';

export default Ember.Component.extend({
  value: null,

  json: function() {
    var value = (this.get('value')||'')+'';
    if ( ['[','{'].indexOf(value.substr(0,1)) >= 0 )
    {
      try {
        var pretty = JSON.stringify(JSON.parse(value),null,2);
        return pretty;
      } catch (e) {
      }
    }

    return null;
  }.property('value'),
});
