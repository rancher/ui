import Ember from "ember";

export default Ember.Object.extend({
  unknownProperty: function(key) {
    return localStorage[key];
  },

  setUnknownProperty: function(key, value) {
    if( Ember.isNone(value) )
    {
      delete localStorage[key];
    }
    else
    {
      localStorage[key] = value;
    }

    this.notifyPropertyChange(key);
    return value;
  },

  clear: function() {
    var i;

    this.beginPropertyChanges();
    for ( i = 0 ; i < localStorage.length ; i++ )
    {
      this.set(localStorage.key(i));
    }

    localStorage.clear();
    this.endPropertyChanges();
  }
});

