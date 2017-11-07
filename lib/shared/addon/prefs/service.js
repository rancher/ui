import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Service.extend({
  userStore: service('user-store'),
  settings: service(),

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
    if (key !== 'app') {
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
          run(() => {
            this.notifyPropertyChange(key);
          });
        });
      }

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

  tablePerPage: computed(C.PREFS.TABLE_COUNT, function() {
    let out = parseInt(this.get(C.PREFS.TABLE_COUNT),10);
    if ( !out ) {
      out = C.TABLES.DEFAULT_COUNT;
    }

    return out;
  }),

  showSystemControl: computed(C.PREFS.SHOW_SYSTEM,`settings.${C.SETTING.SHOW_SYSTEM}`, function() {
    return false;
    /*
    let def = this.get(`settings.${C.SETTING.SHOW_SYSTEM}`);
    return ['always','never'].includes(def) === false;
    */
  }),

  showSystemResources: computed(C.PREFS.SHOW_SYSTEM,`settings.${C.SETTING.SHOW_SYSTEM}`, {
    get() {
      return true;
      /*
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
      */
    },

    set(key, value) {
      this.set(C.PREFS.SHOW_SYSTEM, value);
      return value;
    }
  }),
});
