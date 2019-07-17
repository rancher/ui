import Resource from '@rancher/ember-api-store/models/resource';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

const ClusterTemplate =  Resource.extend({
  globalStore: service(),
  router:      service(),
  modal:       service(),

  revisions:   hasMany('id', 'clustertemplaterevision', 'clusterTemplateId', 'globalStore', null, 'globalStore'),

  canEdit: true,

  type:        'clustertemplate',

  availableActions: computed('actionLinks.[]', () => {
    return [
      {
        label:     'action.revision',
        icon:      'icon icon-copy',
        action:    'newRevision',
        enabled:   true,
      },
    ];
  }),

  revisionsCount: computed('revisions.[]', function() {
    return isNaN(get(this, 'revisions.length')) ? 0 : get(this, 'revisions.length');
  }),

  displayDefaultRevisionId: computed('revisionsCount', 'revisions.[]', function() {
    return get(this, 'defaultRevisionId').split(':')[1];
  }),

  actions: {
    newRevision() {
      this.router.transitionTo('global-admin.cluster-templates.new-revision', this.id);
    },

    edit() {
      this.modalService.toggleModal('modal-edit-cluster-template', { model: this });
    },
  },
});

export default ClusterTemplate;
