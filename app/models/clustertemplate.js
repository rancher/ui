import Resource from 'ember-api-store/models/resource';
import { hasMany } from 'ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

const ClusterTemplate =  Resource.extend({
  globalStore: service(),
  router:      service(),
  modal:       service(),
  access:      service(),

  revisions: hasMany('id', 'clustertemplaterevision', 'clusterTemplateId', 'globalStore', null, 'globalStore'),

  type: 'clustertemplate',

  canCloneRevision: true,

  availableActions: computed('actionLinks.[]', 'canCloneRevision', function() {
    return [
      {
        label:     'action.revision',
        icon:      'icon icon-copy',
        action:    'newRevision',
        enabled:   this.canCloneRevision,
      },
    ];
  }),

  revisionsCount: computed('revisions.[]', function() {
    return isNaN(get(this, 'revisions.length')) ? 0 : get(this, 'revisions.length');
  }),

  latestRevision: computed('revisions.[]', 'revisions.@each.enabled', function() {
    const revisions = (this.revisions || []).filter((revision) => revision.enabled);

    return get(revisions, 'length') === 0
      ? null
      : revisions.sortBy('createdTS').get('lastObject');
  }),

  displayDefaultRevisionId: computed('defaultRevisionId', 'revisions.[]', 'revisionsCount', function() {
    return this.defaultRevisionId.split(':')[1];
  }),

  canEdit: computed('links.update', function() {
    return !!get(this, 'links.update');
  }),


  canRemove: computed('links.remove', function() {
    return !!get(this, 'links.remove');
  }),

  actions: {
    newRevision() {
      this.router.transitionTo('global-admin.cluster-templates.new-revision', this.id, { queryParams: { revision: this.defaultRevisionId } });
    },

    edit() {
      this.modalService.toggleModal('modal-edit-cluster-template', { model: this });
    },
  },
});

export default ClusterTemplate;
