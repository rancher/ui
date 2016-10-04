import Ember from 'ember';
import {normalizeType} from 'ember-api-store/utils/normalize';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';
import ActiveArrayProxy from 'ui/utils/active-array-proxy';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  cookies: Ember.inject.service(),

  defaultPageSize: -1,
  removeAfterDelete: false,

  headers: function() {
    let out = {
      [C.HEADER.ACTIONS]: C.HEADER.ACTIONS_VALUE,
      [C.HEADER.NO_CHALLENGE]: C.HEADER.NO_CHALLENGE_VALUE
    };

    let csrf = this.get(`cookies.${C.COOKIE.CSRF}`);
    if ( csrf ) {
      out[C.HEADER.CSRF] = csrf;
    }

    return out;
  }.property().volatile(),

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
