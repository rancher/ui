import Mixin from '@ember/object/mixin';

export default Mixin.create({
  backing: 'overrideMe with window.localStorage or window.sessionStorage',

  unknownProperty(key) {
    var value; // = undefined;
    var backing = this.get('backing');
    var str = backing.getItem(key);

    if ( str ) {
      try {
        value = JSON.parse(str);
      } catch (e) {
        console.log(`Error parsing storage ['${ key }']`);
        backing.removeItem(key);
        this.notifyPropertyChange(key);
      }
    }

    return value;
  },

  setUnknownProperty(key, value) {
    if (key !== 'app') {
      var backing = this.get('backing');

      if ( value === undefined ) {
        backing.removeItem(key);
      } else {
        backing.setItem(key, JSON.stringify(value));
      }

      this.notifyPropertyChange(key);
    }

    return value;
  },

  clear() {
    var backing = this.get('backing');

    this.beginPropertyChanges();
    for ( var i = 0 ; i < backing.length ; i++ ) {
      var key = backing.key(i);

      if ( key.indexOf('.') >= 0 ) {
        continue;
      }

      this.set(key);
    }

    backing.clear();
    this.endPropertyChanges();
  },

  removeItem() {}
});
