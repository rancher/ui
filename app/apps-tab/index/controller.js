import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import {
  computed, get, observer
} from '@ember/object';
import { once } from '@ember/runloop';

export default Controller.extend({
  projectController: controller('authenticated.project'),
  prefs:             service(),
  intl:              service(),
  catalog:           service(),
  sortBy:            'name',


  tags:              alias('projectController.tags'),
  filteredApps: computed('model.apps.@each.{type,isFromCatalog,tags,state}', 'tags', function() {

    var needTags = get(this, 'tags');

    var out = get(this, 'model.apps').filter((ns) => !C.REMOVEDISH_STATES.includes(get(ns, 'state')));

    if ( needTags && needTags.length ) {

      out = out.filter((obj) => obj.hasTags(needTags));

    }

    return out.sortBy('displayName');

  }),
  templatesObsvr: observer('model.apps.[]', function() {

    once(() => this.get('catalog').fetchAppTemplates(get(this, 'model.apps')));

  }),

});
