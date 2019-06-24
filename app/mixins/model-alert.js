import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Mixin.create({
  router:      service(),
  globalStore: service(),
  scope:       service(),
  intl:        service(),
  pageScope:   reads('scope.currentPageScope'),

  canClone: false,

  relevantState: computed('combinedState', 'alertState', 'state', function() {
    if ( get(this, 'state') === 'removing' ) {
      return 'removing';
    }

    return this.get('combinedState') || this.get('alertState') || 'unknown';
  }),

  isAlertRule: computed('type', function() {
    return (get(this, 'type') || '').endsWith('Rule');
  }),

  init() {
    const stateMap = {
      'muted':                    {
        icon:  'icon icon-tag',
        color: 'text-default'
      },
      'alerting':                 {
        icon:  'icon icon-tag',
        color: 'text-error'
      },
      'inactive':                 {
        icon:  'icon icon-tag',
        color: 'text-warning'
      },
    };

    this.constructor.stateMap = stateMap
    this._super(...arguments);
  },

  displayTargetType: computed('targetType', function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');

    return intl.t(`alertPage.targetTypes.${ t }`);
  }),

  resourceKind: computed('eventRule.resourceKind', function() {
    const rk = get(this, 'eventRule.resourceKind');

    return get(this, 'intl').t(`alertPage.resourceKinds.${ rk }`);
  }),

  firstRecipient: computed('recipients.length', function() {
    const recipient = (get(this, 'recipients') || []).get('firstObject');

    if (recipient && get(recipient, 'notifierId')) {
      const notifierId = get(recipient, 'notifierId');

      if (!notifierId) {
        return null;
      }

      const notifier = get(this, 'globalStore').all('notifier').filterBy('id', notifierId).get('firstObject');

      if (!notifier) {
        return null;
      }

      return `${ notifier.get('displayNameAndType') }`;
    }

    return null;
  }),

  displayRecipient: computed('firstRecipient', 'model.recipients.length', function() {
    const len = get(this, 'recipients.length');
    const firstRecipient = get(this, 'firstRecipient');
    const intl = get(this, 'intl');
    let out = intl.t('alertPage.na');

    if (len === 0) {
      // out = na;
    } else if (len === 1) {
      out = firstRecipient;
    } else {
      out = `${ len } ${ intl.t('alertPage.items') }`;
    }

    return out;
  }),

  nodeName: computed('targetNode.nodeId', function() {
    const id = get(this, 'targetNode.nodeId');

    if (!id) {
      return null;
    }
    const node = get(this, 'globalStore').all('node').filterBy('id', id).get('firstObject');

    if (!node) {
      return null;
    }

    return node.get('displayName');
  }),

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

  availableActions: computed('actionLinks.{mute,unmute,activate,deactivate}', 'isAlertRule', function() {
    const state = this.get('alertState');
    const isAlertRule = get(this, 'isAlertRule');
    let out = [];

    if ( isAlertRule ) {
      out = [
        {
          label:    'action.mute',
          action:   'mute',
          enabled:  state === 'alerting',
          icon:     'icon icon-mute',
          bulkable: true,
        },
        {
          label:    'action.unmute',
          action:   'unmute',
          icon:     'icon icon-unmute',
          enabled:  state === 'muted',
          bulkable: true,
        },
        {
          label:    'action.deactivate',
          action:   'deactivate',
          icon:     'icon icon-pause',
          enabled:  state === 'active',
          bulkable: true,
        },
        {
          label:    'action.activate',
          icon:     'icon icon-play',
          action:   'activate',
          enabled:  state === 'inactive',
          bulkable: true,
        },
      ];
    }

    return out;
  }),
});
