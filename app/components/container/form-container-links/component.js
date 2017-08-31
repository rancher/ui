import Ember from 'ember';
import ContainerChoices from 'ui/mixins/container-choices';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

const headers = [
  {
    name: 'name',
    translationKey: 'formContainerLinks.name.label',
  },
  {
    name: 'alias',
    translationKey: 'formContainerLinks.alias.label',
  },
];

export default Ember.Component.extend(ContainerChoices, {
  growl: Ember.inject.service(),

  // Inputs
  editing: null,
  instance: null,

  linksArray: Ember.computed.alias('instance.instanceLinks'),

  tagName: '',
  errors: null,

  headers,

  actions: {
    addLink: function() {
      let links = this.get('linksArray');
      if ( !links ) {
        links = [];
        this.set('linksArray', links);
      }

      links.pushObject(this.get('store').createRecord({
        type: 'link',
        name: '',
        alias: '',
      }));
    },

    removeLink: function(obj) {
      this.get('linksArray').removeObject(obj);
    },

    followLink: function(str) {
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

      this.get('growl').fromError('Unable to find container for "'+name+'"');
    },
  },

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = (this.get('linksArray')||[]).filterBy('name').get('length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('linksArray.@each.name'),
});
