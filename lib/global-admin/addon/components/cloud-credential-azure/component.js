import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { environments } from 'ui/utils/azure-choices';

export default Component.extend({
  router: service(),

  layout,
  environments,

  tag:              null,
  config:           null,
});
