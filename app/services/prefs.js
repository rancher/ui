import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Service.extend({
  userStore: Ember.inject.service('user-store'),
  settings: Ember.inject.service(),

  unremoved: function() {
    return this.get('userStore').all('userpreference');
  }.property('userStore.generation'),

  findByName: function(key) {
    return this.get('unremoved').filterBy('name',key)[0];
  },

  unknownProperty: function(key) {
    var value; // = undefined;

    var existing = this.findByName(key);
    if ( existing )
    {
      try
      {
        value = JSON.parse(existing.get('value'));
      }
      catch (e)
      {
        console.log("Error parsing storage ['"+key+"']");
        //this.notifyPropertyChange(key);
      }
    }

    return value;
  },

  setUnknownProperty: function(key, value) {
    var obj = this.findByName(key);

    // Delete by set to undefined
    if ( value === undefined )
    {
      if ( obj )
      {
        obj.set('value',undefined);
        obj.delete();
        this.notifyPropertyChange(key);
      }

      return;
    }

    if ( !obj )
    {
      obj = this.get('userStore').createRecord({
        type: 'userPreference',
        name: key,
      });
    }

    let neu = JSON.stringify(value);
    if ( !obj.get('id') || obj.get('value') !== neu ) {
      obj.set('value', neu);
      obj.save().then(() => {
        Ember.run(() => {
          this.notifyPropertyChange(key);
        });
      });
    }

    return value;
  },

  clear: function() {
    this.beginPropertyChanges();

    this.get('unremoved').forEach((obj) => {
      this.set(obj.get('name'), undefined);
    });

    this.endPropertyChanges();
  },

  tablePerPage: Ember.computed(C.PREFS.TABLE_COUNT, function() {
    let out = parseInt(this.get(C.PREFS.TABLE_COUNT),10);
    if ( !out ) {
      out = C.TABLES.DEFAULT_COUNT;
    }

    return out;
  }),

  showSystemControl: Ember.computed(C.PREFS.SHOW_SYSTEM,`settings.${C.SETTING.SHOW_SYSTEM}`, function() {
    let def = this.get(`settings.${C.SETTING.SHOW_SYSTEM}`);
    return ['always','never'].includes(def) === false;
  }),

  showSystemResources: Ember.computed(C.PREFS.SHOW_SYSTEM,`settings.${C.SETTING.SHOW_SYSTEM}`, {
    get() {
      let def = this.get(`settings.${C.SETTING.SHOW_SYSTEM}`);
      let user = this.get(C.PREFS.SHOW_SYSTEM);

      switch ( def ) {
        case 'always':
          return true;
        case 'never':
          return false;
        case 'default_hide':
          return user === true;
        default:
          // also 'default_show':
          // user can be null so it must be exactly false
          return user !== false;
      }
    },

    set(key, value) {
      this.set(C.PREFS.SHOW_SYSTEM, value);
      return value;
    }
  }),
});
