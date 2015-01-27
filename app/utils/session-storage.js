import Ember from "ember";

export default Ember.Object.extend({
  unknownProperty: function(key) {
    return sessionStorage[key];
  },

  setUnknownProperty: function(key, value) {
    if( Ember.isNone(value) )
    {
      delete sessionStorage[key];
    }
    else
    {
      sessionStorage[key] = value;
    }

    this.notifyPropertyChange(key);
    return value;
  },

  clear: function() {
    var i;

    this.beginPropertyChanges();
    for ( i = 0 ; i < sessionStorage.length ; i++ )
    {
      this.set(sessionStorage.key(i));
    }

    sessionStorage.clear();
    this.endPropertyChanges();
  },

  setFlattenedProperties(data,prefix) {
    var self = this;
    Object.keys(data).forEach(function(k) {
      var v = Ember.get(data,k);
      var nestedKey = (prefix ? prefix + ':' : '') + k;

      if ( v && typeof v === 'object' && !Ember.isArray(v) )
      {
        self.setFlattenedProperties(v, nestedKey+':');
      }
      else
      {
        self.set(nestedKey, v);
      }
    });
  }
});

