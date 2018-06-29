import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import {  get } from '@ember/object';
import { hash } from 'rsvp';

export default Resource.extend({
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

      return '***';

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
  type:  'notifier',
  growl: service(),
  intl:  service(),

  globalStore:  service(),
  modalService: service('modal'),

  init(...args) {

    this._super(...args);

  },

  findAlerts() {

    const globalStore = get(this, 'globalStore');
    const clusterId = get(this, 'clusterId');
    const clusterAlerts = globalStore.findAll('clusterAlert', { filter: { clusterId } });
    const projectAlerts = globalStore.findAll('projectAlert');

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
