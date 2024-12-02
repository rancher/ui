import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import { setProperties, get, computed } from '@ember/object';
import { hash } from 'rsvp';
import C from 'ui/utils/constants';
import moment from 'moment';

export default Resource.extend({
  growl:        service(),
  intl:         service(),
  globalStore:  service(),
  modalService: service('modal'),

  type: 'notifier',

  displayNameAndType: computed('displayName', 'notifierType', function() {
    const upperCaseType = (this.notifierType || '').replace(/^\S/, (s) => {
      return s.toUpperCase();
    })

    return `${ this.displayName } (${ upperCaseType })`;
  }),

  notifierTableLabel: computed('dingtalkConfig', 'emailConfig', 'msteamsConfig', 'pagerdutyConfig', 'slackConfig', 'smtpConfig', 'webhookConfig', 'wechatConfig', function(){
    const sc = this.slackConfig;
    const pc = this.pagerdutyConfig;
    const ec = this.smtpConfig;
    const wc = this.webhookConfig;
    const wcc = this.wechatConfig;
    const dtc = this.dingtalkConfig;
    const msc = this.msteamsConfig;

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

  notifierType: computed('dingtalkConfig', 'emailConfig', 'msteamsConfig', 'pagerdutyConfig', 'slackConfig', 'smtpConfig', 'webhookConfig', 'wechatConfig', function(){
    const sc = this.slackConfig;
    const pc = this.pagerdutyConfig;
    const ec = this.smtpConfig;
    const wc = this.webhookConfig;
    const wcc = this.wechatConfig;
    const dtc = this.dingtalkConfig;
    const msc = this.msteamsConfig;

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

  notifierValue: computed('emailConfig', 'pagerdutyConfig', 'slackConfig', 'smtpConfig', 'webhookConfig', 'wechatConfig', function(){
    const sc = this.slackConfig;
    const pc = this.pagerdutyConfig;
    const ec = this.smtpConfig;
    const wc = this.webhookConfig;
    const wcc = this.wechatConfig;

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
    const d = this.created;

    return moment(d).fromNow();
  }),

  notifierLabel: computed('emailConfig', 'pagerdutyConfig', 'slackConfig', 'smtpConfig', 'webhookConfig', 'wechartConfig', 'wechatConfig', function(){
    const sc = this.slackConfig;
    const pc = this.pagerdutyConfig;
    const ec = this.smtpConfig;
    const wc = this.webhookConfig;
    const wcc = this.wechatConfig;

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
    const globalStore = this.globalStore;
    const clusterId = this.clusterId;
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

        return recipients.some((recipient) => recipient.notifierId === this.id);
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

        this.growl
          .error(this.intl
            .t('notifierPage.deleteErrorMessage', {
              displayName: this.displayName,
              alertNames
            }));
      } else {
        sup.apply(self, arguments);
      }
    });
  },
  actions: {
    edit() {
      this.modalService.toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           this.notifierType,
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
      this.modalService.toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        currentType:           this.notifierType,
        model:                 nue,
        mode:                  'clone',
      });
    },
  },

});
