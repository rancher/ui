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

  // Inputs
  service           : null,
  withAlias         : true,
  serviceLinksArray : null,

  classNames: ['accordion-wrapper'],
  expandAll: null,

  init() {
    this._super(...arguments);

    let out = [];
    let store = this.get('store');
    let links = this.get('service.serviceLinks')||[];

    links.forEach((obj) => {
      out.push(store.createRecord({
        type: 'link',
        name: obj.get('name'),
        alias: obj.get('alias'),
      }));
    });

    this.set('serviceLinksArray', out);
  },

  actions: {
    addServiceLink() {
      this.get('serviceLinksArray').pushObject(this.get('store').createRecord({
        type: 'link',
        name: '',
        alias: '',
      }));
    },

    removeServiceLink(obj) {
      this.get('serviceLinksArray').removeObject(obj);
    },
  },


  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },

  serviceLinksArrayDidChange: function() {
    let ary = this.get('serviceLinksArray');
    this.set('service.serviceLinks', ary.filterBy('name'));
  }.observes('serviceLinksArray.@each.{name}'),

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('serviceLinksArray').filter((x) => !!x.get('name')).get('length') || 0;

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('serviceLinksArray.@each.name')
});
