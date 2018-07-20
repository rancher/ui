import { scheduleOnce, later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import { loadScript } from 'ui/utils/load-script';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  settings:   service(),
  prefs:      service(),
  access:     service(),

  layout,
  classNames: ['span-8', 'offset-2', 'modal-telemetry'],
  loading:    true,

  init() {
    this._super(...arguments);
    let self = this;

    let opt = JSON.parse(this.get(`settings.${ C.SETTING.FEEDBACK_FORM }`) || '{}');

    scheduleOnce('afterRender', this, () => {
      loadScript('//js.hsforms.net/forms/v2.js').then(() => {
        window['hbspt'].forms.create({
          css:         '',
          portalId:    opt.portalId, // '468859',
          formId:      opt.formId, // 'bfca2d1d-ed50-4ed7-a582-3f0440f236ca',
          target:      '#feedback-form',
          errorClass:  'form-control',
          onFormReady() {
            self.styleForm();
            $('INPUT[name=rancher_account_id]')[0].value = self.get('access.principal.id');// eslint-disable-line
            $('INPUT[name=github_username]')[0].value = self.get('access.identity.login');// eslint-disable-line
            self.set('loading', false);
          },
          onFormSubmit() {
            self.styleForm();
            later(() =>  {
              self.send('sent');
            }, 1000);
          },
        });
      });
    });
  },

  actions: {
    submit() {
      let form = $('#feedback-form'); // eslint-disable-line

      form.find('INPUT[type=submit]').click();
    },

    sent() {
      this.set(`prefs.${ C.PREFS.FEEDBACK }`, 'sent');
      this.send('cancel');
    },
  },
  styleForm() {
    var self = this;

    let form = $('#feedback-form'); // eslint-disable-line

    form.find('.field').not('.hs_sandbox_acknowledgement')
      .addClass('col-md-6');
    form.find('.field.hs_sandbox_acknowledgement').addClass('span-12');

    form.find('INPUT[type=text],INPUT[type=email],SELECT').addClass('form-control');
    form.find('LABEL').addClass('pt-10');

    form.find('INPUT[type=submit]').addClass('hide');

    form.find('UL').addClass('list-unstyled');
    form.find('INPUT[type=checkbox]').addClass('mr-10');
    form.find('.hs-form-booleancheckbox-display').css('font-weight', 'normal');

    form.find('SELECT').on('change', () => {
      self.styleForm();
    });
  },

});
