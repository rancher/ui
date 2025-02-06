import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';

var GithubConfig = Resource.extend({
  globalStore: service(),

  type: 'githubConfig',
  /*
  _principals: null,

  init() {
    this._super(...arguments);

    if (!get(this, '_principals')) {
      set(this, '_principals', []);
    }

  },

  principalIdsChanged: observer('allowedPrincipalIds.[]', function() {
    let aPIds    = get(this, 'allowedPrincipalIds')||[];
    let promises = [];
    let store    = get(this, 'globalStore');
    const principals = [];

    if (get(aPIds, 'length')) {
      aPIds.forEach(( aID ) => {
        promises.push(store.rawRequest({
          url: `principals/${encodeURIComponent(aID)}`,
          method: 'GET',
        }));
      });

      allSettled(promises).then(( res ) => {

        let success    = res.filterBy('state', 'fulfilled');

        success.forEach( (promise) => {
          let principal = get(promise, 'value.body');

          principals.push(principal);
        });

        set(this, '_principals', principals);
      })
    }
  }),

  allowedPrincipals: computed('_principals.@each.{id}', function() {
    return get(this, '_principals').sortBy('displayName')
  }),
*/

});

export default GithubConfig;
