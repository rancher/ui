import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  classNames: ['accordion-wrapper'],

  detailKey: 'formMetadata.detail',

  instance: null,
  errors: null,
  invalid: false,

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  validate: function () {
    let intl = this.get('intl');
    if (this.get('invalid')) {
      this.set('errors', [intl.t('formMetadata.errors.invalidJSON')])
    } else if (['object', 'null'].indexOf(Ember.typeOf(this.get('instance'))) === -1) {
      this.set('errors', [intl.t('formMetadata.errors.topLevelValueInvalid')]);
    } else {
      this.set('errors', []);
    }
  }.observes('invalid', 'instance'),

  statusClass: null,
  status: function () {
    let k;
    if (this.get('invalid') || ['object', 'null'].indexOf(Ember.typeOf(this.get('instance'))) === -1) {
      k = STATUS.ERROR;
    } else if (!Ember.isNone(this.get('instance')) && Object.keys(this.get('instance')).length > 0) {
      k = STATUS.CONFIGURED;
    } else {
      k = STATUS.NOTCONFIGURED;
    }
    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('invalid'),
});
