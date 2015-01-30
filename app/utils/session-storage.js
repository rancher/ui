import Ember from "ember";

export default Ember.Object.extend({
  unknownProperty: function(key) {
    var val; // = undefined;
    var str = sessionStorage.getItem(key);
    if ( str )
    {
      try
      {
        val = JSON.parse(str);
      }
      catch (e)
      {
        console.log("Error parsing sessionStorage['"+key+"']");
        sessionStorage.removeItem(key);
        this.notifyPropertyChange(key);
      }
    }

    return val;
  },

  setUnknownProperty: function(key, value) {
    if ( value === undefined )
    {
      sessionStorage.removeItem(key);
    }
    else
    {
      sessionStorage.setItem(key, JSON.stringify(value));
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
});

