import Component from '@ember/component';
import layout from './template';
import { computed, set } from '@ember/object';
import { inject as service } from '@ember/service';

const FEATURE_HEADERS = [
  {
    translationKey: 'featureFlags.table.state',
    name:           'state',
    sort:           ['state'],
    width:          '100px',
  },
  {
    translationKey: 'featureFlags.table.name',
    name:           'name',
    sort:           ['name'],
    searchField:    'name',
    width:          '300px',
  },
  {
    translationKey: 'featureFlags.table.description',
    name:           'description',
    sort:           ['description'],
    searchField:    'description',
  },
];

const TEMP_FEATURE_DESCRIPTIONS = [
  {
    feature:                   'istio-virtual-service-ui',
    descriptionTranslationKey: 'featureFlags.features.istioVirtualServiceUi'
  },
  {
    feature:                   'unsupported-storage-drivers',
    descriptionTranslationKey: 'featureFlags.features.unsupportedStorageDrivers'
  }
]

export default Component.extend({
  intl: service(),

  layout,

  bulkActions:         false,
  descending:          false,
  featuresHeaders:     FEATURE_HEADERS,
  featureDescriptions: TEMP_FEATURE_DESCRIPTIONS,
  model:               null,
  searchText:          '',
  sortBy:              'name',
  stickyHeader:        false,

  filteredFeatures: computed('model.@each.{value,description,id,name}', function() {
    let { model } = this;

    model.forEach((m) => {
      let match = this.featureDescriptions.findBy('feature', m.name);

      if (match) {
        set(m, 'description', this.intl.t(match.descriptionTranslationKey));
      }
    })

    return model;
  }),
});
