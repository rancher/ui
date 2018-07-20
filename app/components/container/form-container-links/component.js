import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ContainerChoices from 'ui/mixins/container-choices';
import {
  STATUS,
  STATUS_INTL_KEY,
  classForStatus
} from 'shared/components/accordion-list-item/component';
import layout from './template';

const headers = [
  {
    name:           'name',
    translationKey: 'formContainerLinks.name.label',
  },
  {
    name:           'alias',
    translationKey: 'formContainerLinks.alias.label',
  },
];

export default Component.extend(ContainerChoices, {
  router: service(),
  growl:  service(),

  layout,
  // Inputs
  editing:  null,
  instance: null,

  tagName:    '',
  errors:  null,

  headers,

  statusClass: null,
  linksArray:  alias('instance.instanceLinks'),

  actions: {
    addLink() {
      let links = this.get('linksArray');

      if ( !links ) {
        links = [];
        this.set('linksArray', links);
      }

      links.pushObject(this.get('store').createRecord({
        type:  'link',
        name:  '',
        alias: '',
      }));
    },

    removeLink(obj) {
      this.get('linksArray').removeObject(obj);
    },

    followLink(str) {
      let stack, stackName, containerName;

      if ( str.includes('/')) {
        [stackName, containerName] = name.split('/');
        let stacks = this.get('store').all('stack');

        stack = stacks.findBy('name', stackName);
      } else {
        stack = this.get('stack');
        containerName = str;
      }

      if ( stack ) {
        let container = stack.get('instances').findBy('name', containerName);

        if ( container ) {
          this.get('router').transitionTo('container', container.get('id'));

          return;
        }
      }

      this.get('growl').fromError(`Unable to find container for "${ name }"`);
    },
  },

  status: function() {
    let k = STATUS.NONE;
    let count = (this.get('linksArray') || []).filterBy('name').get('length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));

    return this.get('intl').t(`${ STATUS_INTL_KEY }.${ k }`, { count });
  }.property('linksArray.@each.name'),
});
