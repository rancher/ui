import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
// import { reference } from '@rancher/ember-api-store/utils/denormalize';
import Resource from '@rancher/ember-api-store/models/resource';

export default Resource.extend({
  globalStore: service(),

  principal: computed('userPrincipalId', 'groupPrincipalId', function() {
    if (get(this, 'userPrincipalId')) {
      return this.globalStore.getById('principal', this.userPrincipalId)
    } else if (get(this, 'groupPrincipalId')) {
      return this.globalStore.getById('principal', this.groupPrincipalId)
    }

    return;
  }),

  displayType: computed('principal.{id}', function() {
    let principal = get(this, 'principal');
    let type      = null;

    if (principal && get(principal, 'displayType')) {
      type = get(principal, 'displayType');
    } else if (principal && get(principal, 'principalType')) {
      type = get(this, 'principalType');
    }

    return type;
  }),

  displayName: computed('principal.{id}', function() {
    let principal = get(this, 'principal');
    let name      = null;

    if (principal && get(principal, 'displayName')) {
      name = get(principal, 'displayName');
    } else if (get(this, 'userPrincipalId')) {
      name = get(this, 'userPrincipalId');
    } else if (get(this, 'groupPrincipalId')) {
      name = get(this, 'groupPrincipalId');
    }

    return name;
  }),

});
