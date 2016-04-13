import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';
import UnpurgedArrayProxy from 'ui/utils/unpurged-array-proxy';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  defaultPageSize: -1,

  headers: function() {
    return {
      // Please don't send us www-authenticate headers
      [C.HEADER.NO_CHALLENGE]: C.HEADER.NO_CHALLENGE_VALUE,
    };
  }.property(),

  // Override store.all() so that it only returns un-purged resources.
  reallyAll: function(type) {
    type = normalizeType(type);
    var proxy = Ember.ArrayProxy.create({
      content: this._group(type)
    });

    return proxy;
  },

  all: function(type) {
    type = normalizeType(type);
    var proxy = UnpurgedArrayProxy.create({
      sourceContent: this._group(type)
    });

    return proxy;
  },

  // find(type) && return allActive(type)
  findAllActive: function(type) {
    type = normalizeType(type);

    if ( this.haveAll(type) )
    {
      return Ember.RSVP.resolve(this.allActive(type),'All active '+ type + ' already cached');
    }
    else
    {
      return this.find(type).then(() => {
        return this.allActive(type);
      });
    }
  },

  allActive: function(type) {
    type = normalizeType(type);
    var proxy = ActiveArrayProxy.create({
      sourceContent: this._group(type)
    });

    return proxy;
  },

  findAllUnremoved: function(type) {
    type = normalizeType(type);

    if ( this.haveAll(type) )
    {
      return Ember.RSVP.resolve(this.allUnremoved(type),'All unremoved '+ type + ' already cached');
    }
    else
    {
      return this.find(type).then(() => {
        return this.allUnremoved(type);
      });
    }
  },

  allUnremoved: function(type) {
    type = normalizeType(type);
    var proxy = UnremovedArrayProxy.create({
      sourceContent: this._group(type)
    });

    return proxy;
  }
});
