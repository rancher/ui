import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set, computed } from '@ember/object'
import moment from 'moment';

export default Mixin.create({
  scope:     service(),
  config:    alias('model.config'),
  project:   alias('scope.currentProject'),
  cluster:   alias('scope.currentCluster'),
  pageScope: alias('scope.currentPageScope'),

  init(...args) {
    this._super(...args)
    const indexPrefix = get(this, 'config.indexPrefix');

    if (!indexPrefix) {
      set(this, 'config.indexPrefix', get(this, 'defaultIndexPrefix'));
    }
  },

  defaultIndexPrefix: computed('project.name', 'cluster.name', function() {
    const pageScope = get(this, 'pageScope')
    const prefix = get(this, 'cluster.name') || get(this, 'cluster.id');

    if (pageScope === 'cluster') {
      return prefix.toLowerCase();
    } else {
      return `${ prefix  }_${  get(this, 'project.name') }`.toLowerCase();
    }
  }),

  logPreview: computed('esIndex', 'outputTags', function() {
    const index = get(this, 'esIndex');
    const outputTags = get(this, 'outputTags');
    const template = `{
  "_index": "${ index }",
  "_id": "AWD68LuuhwVvf5LMJq1h",
  "_source": {
    "log": "time=\"2018-01-15T17:49:26Z\" level=info msg=\"Creating cluster event [Created container]\"\n",
    "kubernetes": {
      "container_name": "cattle",
      "namespace_name": "default",
      "pod_name": "cattle-6b4ccb5b9d-tzs4q",
      "labels": {
        "app": "cattle",
        "pod-template-hash": "2607761658"
      },
      "host": "47.89.14.205",
      "master_url": "https://10.233.0.1:443/api"
    },
${ outputTags }
  },
  ...
}`;

    return template
  }),

  outputTags: computed('model.outputTags', function() {
    const keyValueMap = get(this, 'model.outputTags');

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `    "${ key }": "${ keyValueMap[key] }"`).join(',\n');
  }),

  dateFormatString: computed('config.dateFormat', function() {
    const fmt = this.get('config.dateFormat');

    return moment().format(fmt);
  }),

  esIndex: computed('config.indexPrefix', 'dateFormatString', function() {
    return `${ get(this, 'config.indexPrefix')  }-${  get(this, 'dateFormatString') }`;
  }),
});
