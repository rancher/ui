import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { computed, get, observer } from '@ember/object';
import { once } from '@ember/runloop';
import { filter } from 'ui/utils/search-text';

export default Controller.extend({
  prefs:   service(),
  intl:    service(),
  catalog: service(),
  sortBy:  'name',

  templatesObsvr: observer('model.apps.[]', function() {
    once(() => this.get('catalog').fetchAppTemplates(get(this, 'model.apps')));
  }),

  filteredApps: computed('model.apps.@each.{type,isFromCatalog,state}', 'searchText', function() {
    let apps = get(this, 'model.apps').filter((ns) => !C.REMOVEDISH_STATES.includes(get(ns, 'state')));

    apps = apps.sortBy('displayName');

    const { matches } = filter(apps, get(this, 'searchText'));

    const group = [];
    let dataIndex = 0;

    matches.forEach((app, index) => {
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
