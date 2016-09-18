import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['githubRepo','githubBranch','composeFiles','system'],
  githubRepo: null,
  githubBranch: null,
  composeFiles: null,
  system: false,

  error: null,
  editing: false,

  willSave: function() {
    let out = this._super(...arguments);
    let externalId = '';
    if ( this.get('system') )
    {
      externalId = C.EXTERNAL_ID.KIND_SYSTEM + C.EXTERNAL_ID.KIND_SEPARATOR + 'user';
    }

    this.set('primaryResource.externalId', externalId);
    return out;
  },

  doneSaving: function() {
    return this.transitionToRoute('stack', this.get('primaryResource.id'));
  },
});
