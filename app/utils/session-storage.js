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
  }
});

