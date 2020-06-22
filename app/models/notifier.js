import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import {  setProperties, get, computed } from '@ember/object';
import { hash } from 'rsvp';
import C from 'ui/utils/constants';
import moment from 'moment';

export default Resource.extend({
  growl:        service(),
  intl:         service(),
  globalStore:  service(),
  modalService: service('modal'),

  type:         'notifier',

  displayNameAndType: computed('displayName', 'notifierType', function() {
    const upperCaseType = (get(this, 'notifierType') || '').replace(/^\S/, (s) => {
      return s.toUpperCase();
    })

    return `${ get(this, 'displayName') } (${ upperCaseType })`
  }),

  notifierTableLabel: computed('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig', 'wechatConfig', 'dingtalkConfig', 'msteamsConfig', function(){
    const sc = get(this, 'slackConfig');
    const pc = get(this, 'pagerdutyConfig');
    const ec = get(this, 'smtpConfig');
    const wc = get(this, 'webhookConfig');
    const wcc = get(this, 'wechatConfig');
    const dtc = get(this, 'dingtalkConfig');
    const msc = get(this, 'msteamsConfig');

    if ( sc ) {
      return C.NOTIFIER_TABLE_LABEL.SLACK;
    }
    if ( pc ) {
      return C.NOTIFIER_TABLE_LABEL.PAGERDUTY;
    }
    if ( ec ) {
      return C.NOTIFIER_TABLE_LABEL.SMTP;
    }
    if ( wc ) {
      return C.NOTIFIER_TABLE_LABEL.WEBHOOK;
    }
    if ( wcc ) {
      return C.NOTIFIER_TABLE_LABEL.WECHAT;
    }
    if ( dtc ) {
      return C.NOTIFIER_TABLE_LABEL.DINGTALK;
    }
    if ( msc ) {
      return C.NOTIFIER_TABLE_LABEL.MICROSOFTTEAMS;
    }

    return C.NOTIFIER_TABLE_LABEL.DEFAULT;
  }),

  notifierType: computed('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig', 'wechatConfig', 'dingtalkConfig', 'msteamsConfig', function(){
    const sc = get(this, 'slackConfig');
    const pc = get(this, 'pagerdutyConfig');
    const ec = get(this, 'smtpConfig');
    const wc = get(this, 'webhookConfig');
    const wcc = get(this, 'wechatConfig');
    const dtc = get(this, 'dingtalkConfig');
    const msc = get(this, 'msteamsConfig');

    if ( sc ) {
      return 'slack';
    }
    if ( pc ) {
      return 'pagerduty';
    }
    if ( ec ) {
      return 'email';
    }
    if ( wc ) {
      return 'webhook';
    }
    if ( wcc ) {
      return 'wechat';
    }
    if ( dtc ) {
      return 'dingtalk';
    }
    if ( msc ) {
      return 'msteams';
    }

    return null;
  }),

  notifierValue: computed('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig', 'wechatConfig', function(){
    const sc = get(this, 'slackConfig');
    const pc = get(this, 'pagerdutyConfig');
    const ec = get(this, 'smtpConfig');
    const wc = get(this, 'webhookConfig');
    const wcc = get(this, 'wechatConfig');

    if ( sc ) {
      return get(sc, 'defaultRecipient');
    }
    if ( pc ) {
      return get(pc, 'serviceKey');
    }
    if ( ec ) {
      return get(ec, 'defaultRecipient');
    }
    if ( wc ) {
      return get(wc, 'url');
    }
    if ( wcc ) {
      return get(wcc, 'defaultRecipient');
    }

    return '';
  }),

  displayCreated: computed('created', function(){
    const d = get(this, 'created');

    return moment(d).fromNow();
  }),

  notifierLabel: computed('slackConfig', 'pagerdutyConfig', 'emailConfig', 'webhookConfig', 'wechartConfig', function(){
    const sc = get(this, 'slackConfig');
    const pc = get(this, 'pagerdutyConfig');
    const ec = get(this, 'smtpConfig');
    const wc = get(this, 'webhookConfig');
    const wcc = get(this, 'wechatConfig');

    if ( sc ) {
      return 'Channel';
    }
    if ( pc ) {
      return 'Service Key';
    }
    if ( ec ) {
      return 'Address';
    }
    if ( wc ) {
      return 'URL';
    }
    if ( wcc ) {
      return 'Recipient';
    }

    return 'Notifier';
  }),

  findAlerts(){
    const globalStore = get(this, 'globalStore');
    const clusterId = get(this, 'clusterId');
    const clusterAlertGroups = globalStore.find('clusterAlertGroup', null, { filter: { clusterId } });
    const projectAlertGroups = globalStore.findAll('projectAlertGroup');

    return hash({
      clusterAlertGroups,
      projectAlertGroups,
    }).then(({
      clusterAlertGroups,
      projectAlertGroups,
    }) => {
      const alerts = [
        ...clusterAlertGroups.content,
        ...projectAlertGroups.content,
      ].filter((alert) => {
        const recipients = get(alert, 'recipients');

        if ( !recipients || recipients.length === 0 ) {
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
      if ( alerts.length ) {
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
      get(this, 'modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           get(this, 'notifierType'),
        model:                 this,
        mode:                  'edit',
      });
    },

    clone() {
      const nue = this.clone();

      setProperties(nue, {
        id:   null,
        name: null
      });
      get(this, 'modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           get(this, 'notifierType'),
        model:                 nue,
        mode:                  'clone',
      });
    },
  },

});
