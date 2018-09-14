import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import { all } from 'rsvp'
import { get, set } from '@ember/object'
import { isArray } from '@ember/array'
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  scope: service(),

  classNames: ['medium-modal'],

  layout,
  model:       null,
  allProjects: null,
  projectId:   null,
  saving:      false,

  originalModel: alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);
    this.set('allProjects', this.get('globalStore').all('project').filterBy('clusterId', this.get('scope.currentCluster.id')));

    let list = get(this, 'originalModel');

    if ( !isArray(list) ) {
      list = [list];
    }
    set(this, 'model', list);
  },

  actions: {
    save() {
      const promises = [];
      let list = get(this, 'model');

      if ( !isArray(list) ) {
        list = [list];
      }

      list.forEach((ns) => {
        promises.push(ns.doAction('move', { projectId: get(this, 'projectId') }));
      })

      all(promises).then(() => {
        window.location.reload();
      }).catch((/* err */) => {
        // actual error is handled by the growl plugin
        set(this, 'saving', false);
      });
    },
  }
});
