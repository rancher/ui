import Mixin from '@ember/object/mixin';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { addAction } from 'ui/utils/add-view-action';

export default Mixin.create(ViewNewEdit, {
  configField: '<override me>',

  close: null, // action to finish adding

  globalStore: service(),
  router:     service(),

  cluster: alias('model.cluster'),
  primaryResource: alias('model.cluster'),
  errors: null,

  init() {
    this._super(...arguments);
  },

  actions: {
    close() {
      this.sendAction('close');
    }
  },

  config: computed('configField', function() {
    const field = 'cluster.' + get(this, 'configField');
    return get(this, field);
  }),

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
