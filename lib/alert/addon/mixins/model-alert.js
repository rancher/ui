import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Mixin.create({
  router: service(),
  globalStore: service(),
  scope: service(),
  intl: service(),
  pageScope: reads('scope.currentPageScope'),

  relevantState: function() {
    return this.get('combinedState') || this.get('alertState') || 'unknown';
  }.property('combinedState','alertState'),

  init() {

    const stateMap = {
      'muted':                    {icon: 'icon icon-tag',           color: 'text-default'},
      'alerting':                 {icon: 'icon icon-tag',           color: 'text-error'},
      'inactive':                 {icon: 'icon icon-tag',           color: 'text-warning'},
    };

    this.constructor.stateMap = stateMap
  },

  displayTargetType: function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');
    return intl.t(`alertPage.targetTypes.${t}`);
  }.property('targetType'),

  resourceKind: function() {
    const rk = get(this, 'targetEvent.resourceKind');
    return get(this, 'intl').t(`alertPage.resourceKinds.${rk}`);

  }.property('targetEvent.resourceKind'),

  firstRecipient: function() {
    const recipient = (get(this, 'recipients') || []).get('firstObject');
    if (recipient && get(recipient, 'notifierId')) {
      const notifierId = get(recipient, 'notifierId');
      if (!notifierId) return null;
      const notifier = get(this, 'globalStore').all('notifier').filterBy('id', notifierId).get('firstObject');
      if (!notifier) {
        return null;
      }
      return notifier.get('displayName');
    }
    return null;
  }.property('recipients.length'),

  nodeName: function() {
    const id = get(this, 'targetNode.nodeId');
    if (!id) {
      return null;
    }
    const node = get(this, 'globalStore').all('node').filterBy('id', id).get('firstObject');
    if (!node) {
      return null;
    }
    return node.get('displayName');
  }.property('targetNode.nodeId'),

  actions: {
    edit() {
      const ps = get(this, 'pageScope');
      const id = get(this, 'id');
      if (ps === 'cluster') {
        get(this, 'router').transitionTo('authenticated.cluster.alert.edit', id);
      } else if (ps === 'project') {
        get(this, 'router').transitionTo('authenticated.project.alert.edit', id);
      }
    },
    mute() {
      return this.doAction('mute');
    },
    unmute() {
      return this.doAction('unmute');
    },
    activate() {
      return this.doAction('activate');
    },
    deactivate() {
      return this.doAction('deactivate');
    },
  },

  availableActions: function() {
    // let a = this.get('actionLinks');
    let l = this.get('links');
    const state = this.get('alertState');
    return [
      {
        label: 'action.edit',
        icon: 'icon icon-edit',
        action: 'edit',
        enabled: !!l.update,
      },
      {divider: true },
      {
        label: 'action.mute',
        action: 'mute',
        enabled: state === 'alerting',
        icon: 'icon icon-mute',
        bulkable: true,
      },
      {
        label: 'action.unmute',
        action: 'unmute',
        icon: 'icon icon-unmute',
        enabled: state === 'muted',
        bulkable: true,
      },
      {
        label: 'action.deactivate',
        action: 'deactivate',
        icon: 'icon icon-pause',
        enabled: state === 'active',
        bulkable: true,
      },
      {
        label: 'action.activate',
        icon: 'icon icon-play',
        action: 'activate',
        enabled: state === 'inactive',
        bulkable: true,
      },
      {
        label: 'action.remove',
        icon: 'icon icon-trash',
        action: 'promptDelete',
        enabled: !!l.remove,
        altAction: 'delete',
        bulkable: true,
      },
      {divider: true},
      {
        label: 'action.viewInApi',
        icon: 'icon icon-external-link',
        action: 'goToApi',
        enabled: true
      },
    ];
  }.property('actionLinks.{mute,unmute}','links.{update,remove}'),
});
