import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import DisplayImage from 'shared/mixins/display-image';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

var Container = Resource.extend(DisplayImage, {
  modalService: service('modal'),
  links:        {},
  type:         'container',

  pod: reference('podId'),

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

  actions:      {
    shell() {
      get(this, 'modalService').toggleModal('modal-shell', {
        model:         get(this, 'pod'),
        containerName: get(this, 'name')
      });
    },

    logs() {
      get(this, 'modalService').toggleModal('modal-container-logs', {
        model:         get(this, 'pod'),
        containerName: get(this, 'name')
      });
    },
  },

});

export default Container;