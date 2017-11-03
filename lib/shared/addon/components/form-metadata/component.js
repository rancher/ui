import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  instance: null,
  detailKey: 'formMetadata.detail',
  errors: null,
  valid: true,

  classNames: ['accordion-wrapper'],

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  validate: function () {
    let intl = this.get('intl');
    if ( this.get('valid') ) {
      if ( ['object', 'null'].indexOf(Ember.typeOf(this.get('instance.metadata'))) === -1 ) {
        this.set('errors', [intl.t('formMetadata.errors.topLevelValueInvalid')]);
      } else {
        this.set('errors', []);
      }
    } else {
      this.set('errors', [intl.t('formMetadata.errors.invalidJSON')]);
    }
  }.observes('valid', 'instance.metadata'),

  statusClass: null,
  status: function () {
    let k;
    if (this.get('errors.length') ) {
      k = STATUS.ERROR;
    } else if (!Ember.isNone(this.get('instance.metadata')) && Object.keys(this.get('instance.metadata')).length > 0) {
      k = STATUS.CONFIGURED;
    } else {
      k = STATUS.NOTCONFIGURED;
    }
    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('errors.length'),
});
