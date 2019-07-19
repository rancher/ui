import Resource from '@rancher/ember-api-store/models/resource';
import { hasMany } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { not } from '@ember/object/computed';

const ClusterTemplate =  Resource.extend({
  globalStore: service(),
  router:      service(),
  modal:       service(),
  access:      service(),

  revisions: hasMany('id', 'clustertemplaterevision', 'clusterTemplateId', 'globalStore', null, 'globalStore'),

  type:      'clustertemplate',

  canCloneRevision: not('isReadOnly'),
  canEdit:          not('isReadOnly'),

  availableActions: computed('actionLinks.[]', function() {
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

  displayDefaultRevisionId: computed('revisionsCount', 'revisions.[]', function() {
    return get(this, 'defaultRevisionId').split(':')[1];
  }),

  canRemove: computed('links.remove', 'isReadOnly', function() {
    return !!get(this, 'links.remove') && !get(this, 'isReadOnly');
  }),

  isReadOnly: computed('access.principal.id', function() {
    let {
      members = [],
      creatorId,
      access: { principal: { id: currentPrincipalId } }
    }                  = this;
    let roles          = C.CLUSTER_TEMPLATE_ROLES;
    let accessType     = roles.READ_ONLY;
    let principalMatch = members.findBy('principalId', currentPrincipalId);

    if (principalMatch) {
      accessType = principalMatch.accessType;
    } else {
      if (this.access.me.id === creatorId) {
        accessType = roles.OWNER;
      }
    }

    return accessType === roles.READ_ONLY;
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
