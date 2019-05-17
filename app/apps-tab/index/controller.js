import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { computed, get, observer } from '@ember/object';
import { once } from '@ember/runloop';

export default Controller.extend({
  prefs:             service(),
  intl:              service(),
  catalog:           service(),
  projectController: controller('authenticated.project'),
  sortBy:            'name',


  tags:              alias('projectController.tags'),
  templatesObsvr: observer('model.apps.[]', function() {
    once(() => this.get('catalog').fetchAppTemplates(get(this, 'model.apps')));
  }),

  filteredApps: computed('model.apps.@each.{type,isFromCatalog,tags,state}', 'tags', function() {
    var needTags = get(this, 'tags');

    var apps = get(this, 'model.apps').filter((ns) => !C.REMOVEDISH_STATES.includes(get(ns, 'state')));

    if ( needTags && needTags.length ) {
      apps = apps.filter((obj) => obj.hasTags(needTags));
    }

    apps = apps.filterBy('isIstio', false);
    apps = apps.sortBy('displayName');

    const group = [];
    let dataIndex = 0;

    apps.forEach((app, index) => {
      if ( index % 2 === 0 ) {
        group.push([app]);
        dataIndex++;
      } else {
        group[dataIndex - 1].push(app);
      }
    });

    return group;
  }),
});
