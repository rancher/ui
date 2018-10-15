import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import {  get, computed } from '@ember/object';
import { hash } from 'rsvp';
import C from 'ui/utils/constants';
import moment from 'moment';

export default Resource.extend({
  growl:        service(),
  intl:  service(),

  globalStore:  service(),
  modalService: service('modal'),

  type:         'notifier',
  init(...args) {
    this._super(...args);
  },

  displayNameAndType: computed('displayName', 'notifierType', function() {
    const upperCaseType = (get(this, 'notifierType') || '').replace(/^\S/, (s) => {
      return s.toUpperCase();
    })

    return `${ get(this, 'displayName') } (${ upperCaseType })`
  }),

  notifierTableLabel: computed('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig', function() {
    const sc = get(this, 'slackConfig');
    const pc = get(this, 'pagerdutyConfig');
    const ec = get(this, 'smtpConfig');
    const wc = get(this, 'webhookConfig');

    if (sc) {
      return C.NOTIFIER_TABLE_LABEL.SLACK;
    }
    if (pc) {
      return C.NOTIFIER_TABLE_LABEL.PAGERDUTY;
    }
    if (ec) {
      return C.NOTIFIER_TABLE_LABEL.SMTP;
    }
    if (wc) {
      return C.NOTIFIER_TABLE_LABEL.WEBHOOK;
    }

    return C.NOTIFIER_TABLE_LABEL.DEFAULT;
  }),

  notifierType: function() {
    const sc = this.get('slackConfig');
    const pc = this.get('pagerdutyConfig');
    const ec = this.get('smtpConfig');
    const wc = this.get('webhookConfig');

    if (sc) {
      return 'slack';
    }
    if (pc) {
      return 'pagerduty';
    }
    if (ec) {
      return 'email';
    }
    if (wc) {
      return 'webhook';
    }

    return null;
  }.property('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig'),

  notifierValue: function() {
    const sc = this.get('slackConfig');
    const pc = this.get('pagerdutyConfig');
    const ec = this.get('smtpConfig');
    const wc = this.get('webhookConfig');

    if (sc) {
      return get(sc, 'defaultRecipient');
    }
    if (pc) {
      return get(pc, 'serviceKey');
    }
    if (ec) {
      return get(ec, 'defaultRecipient');
    }
    if (wc) {
      return get(wc, 'url');
    }

    return '';
  }.property('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig'),

  displayCreated: function() {
    const d = get(this, 'created');

    return moment(d).fromNow();
  }.property('created'),

  notifierLabel: function() {
    const sc = this.get('slackConfig');
    const pc = this.get('pagerdutyConfig');
    const ec = this.get('smtpConfig');
    const wc = this.get('webhookConfig');

    if (sc) {
      return 'Channel';
    }
    if (pc) {
      return 'Service Key';
    }
    if (ec) {
      return 'Address';
    }
    if (wc) {
      return 'URL';
    }

    return 'Notifier';
  }.property('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig'),
  findAlerts() {
    const globalStore = get(this, 'globalStore');
    const clusterId = get(this, 'clusterId');
    const clusterAlerts = globalStore.findAll('clusterAlertRule', { filter: { clusterId } });
    const projectAlerts = globalStore.findAll('projectAlertRule');

    return hash({
      clusterAlerts,
      projectAlerts,
    }).then(({
      clusterAlerts,
      projectAlerts,
    }) => {
      const alerts = [
        ...clusterAlerts.content,
        ...projectAlerts.content,
      ].filter((alert) => {
        const recipients = get(alert, 'recipients');

        if (!recipients || recipients.length === 0) {
          return false;
        }

        return recipients.some((recipient) => recipient.notifierId === get(this, 'id'));
      });

      return alerts;
    });
  },
  delete() {
    const self = this;
    const sup = self._super;

    return this.findAlerts().then((alerts) => {
      if (alerts.length) {
        const alertNames = alerts.map((alert) => get(alert, 'displayName')).join(',');

        get(this, 'growl')
          .error(get(this, 'intl')
            .t('notifierPage.deleteErrorMessage', {
              displayName: get(this, 'displayName'),
              alertNames
            }));
      } else {
        sup.apply(self, arguments);
      }
    });
  },
  actions: {
    edit() {
      this.get('modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           get(this, 'notifierType'),
        model:                 this,
        mode:                  'edit',
      });
    },

    clone() {
      const nue = this.clone();

      nue.set('id', null);
      nue.set('name', null);
      this.get('modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           get(this, 'notifierType'),
        model:                 nue,
        mode:                  'clone',
      });
    },
  },

});
