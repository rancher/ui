import { typeOf, isNone } from '@ember/utils';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  editing: true,
  model: null,
  detailKey: 'formAnnotations.detail',
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
      if ( ['object', 'null'].indexOf(typeOf(this.get('model.annotations'))) === -1 ) {
        this.set('errors', [intl.t('formAnnotations.errors.topLevelValueInvalid')]);
      } else {
        this.set('errors', []);
      }
    } else {
      this.set('errors', [intl.t('formAnnotations.errors.invalidJSON')]);
    }
  }.observes('valid', 'model.annotations'),

  statusClass: null,
  status: function () {
    let k;
    if (this.get('errors.length') ) {
      k = STATUS.ERROR;
    } else if (!isNone(this.get('model.annotations')) && Object.keys(this.get('model.annotations')).length > 0) {
      k = STATUS.CONFIGURED;
    } else {
      k = STATUS.NOTCONFIGURED;
    }
    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('errors.length'),
});
