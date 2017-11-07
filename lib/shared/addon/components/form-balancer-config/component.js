import { empty } from '@ember/object/computed';
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
  settings: service(),

  classNames: ['accordion-wrapper'],

  isEmpty: empty('service.lbConfig.config'),

  statusClass: null,
  status: function() {
    let k = STATUS.CONFIGURED;
    if ( this.get('isEmpty') ) {
      k = STATUS.NONE;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('isEmpty'),
});
