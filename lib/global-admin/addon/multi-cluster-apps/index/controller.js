import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { computed, get, observer } from '@ember/object';
import { once } from '@ember/runloop';

export default Controller.extend({
  prefs:   service(),
  intl:    service(),
  catalog: service(),
  sortBy:  'name',

  templatesObsvr: observer('model.apps.[]', function() {
    once(() => this.get('catalog').fetchAppTemplates(get(this, 'model.apps')));
  }),

  filteredApps: computed('model.apps.@each.{type,isFromCatalog,state}', function() {
    let apps = get(this, 'model.apps').filter((ns) => !C.REMOVEDISH_STATES.includes(get(ns, 'state')));

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
