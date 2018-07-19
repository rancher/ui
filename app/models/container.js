import Resource from 'ember-api-store/models/resource';
import DisplayImage from 'shared/mixins/display-image';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

var Container = Resource.extend(DisplayImage, {
  availableActions: computed('state', function() {

    let isRunning = get(this, 'state') === 'running';

    var choices = [
      {
        label:     'action.execute',
        icon:      'icon icon-terminal',
        action:    'shell',
        enabled:   isRunning,
      },
      {
        label:     'action.logs',
        icon:      'icon icon-file',
        action:    'logs',
        enabled:   true,
      },
    ];

    return choices;

  }),
  modalService: service('modal'),
  links:        {},

  actions:      {
    shell() {

      get(this, 'modalService').toggleModal('modal-shell', { model: get(this, 'pod') });

    },

    logs() {

      get(this, 'modalService').toggleModal('modal-container-logs', get(this, 'pod'));

    },
  },

  type:  'container',
});

export default Container;
