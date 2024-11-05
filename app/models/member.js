import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
// import { reference } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  globalStore: service(),

  principal: computed('userPrincipalId', 'groupPrincipalId', function() {
    if (this.userPrincipalId) {
      return this.globalStore.getById('principal', this.userPrincipalId)
    } else if (this.groupPrincipalId) {
      return this.globalStore.getById('principal', this.groupPrincipalId)
    }

    return;
  }),

  displayType: computed('principal.id', 'principalType', function() {
    let principal = this.principal;
    let type      = null;

    if (principal && get(principal, 'displayType')) {
      type = get(principal, 'displayType');
    } else if (principal && get(principal, 'principalType')) {
      type = this.principalType;
    }

    return type;
  }),

  displayName: computed('groupPrincipalId', 'principal.id', 'userPrincipalId', function() {
    let principal = this.principal;
    let name      = null;

    if (principal && get(principal, 'displayName')) {
      name = get(principal, 'displayName');
    } else if (this.userPrincipalId) {
      name = this.userPrincipalId;
    } else if (this.groupPrincipalId) {
      name = this.groupPrincipalId;
    }

    return name;
  }),

});
