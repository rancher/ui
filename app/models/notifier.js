import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

const Notifier = Resource.extend({
  type: 'notifier',

  modalService: service('modal'),

  init(...args) {
    this._super(...args);
  },

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

  actions: {
    edit() {
      this.get('modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType: get(this, 'notifierType'),
        model: this,
        mode: 'edit',
      });
    },

    clone() {
      const nue = this.clone();
      nue.set('id', null);
      nue.set('name', null);
      this.get('modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType: get(this, 'notifierType'),
        model: nue,
        mode: 'clone',
      });
    },
  },

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

  availableActions: function() {
    // let a = this.get('actionLinks');
    let l = this.get('links');
    return [
      {
        label: 'action.edit',
        icon: 'icon icon-edit',
        action: 'edit',
        enabled: true,
      },
      {
        label: 'action.clone',
        action: 'clone',
        icon: 'icon icon-copy',
        enabled: true,
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
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}'),
});

export default Notifier;
