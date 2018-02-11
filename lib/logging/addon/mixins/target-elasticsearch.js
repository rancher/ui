import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object'

export default Mixin.create({
  scope: service(),
  config: alias('model.config'),
  project: alias('scope.currentProject'),
  cluster: alias('scope.currentCluster'),
  pageScope: alias('scope.currentPageScope'),

  init(...args) {
    this._super(...args)
    set(this, 'config.indexPrefix', get(this, 'defaultIndexPrefix'));
  },

  defaultIndexPrefix: function() {
    const pageScope = get(this, 'pageScope')
    if (pageScope === 'cluster') {
      return get(this, 'cluster.name');
    } else if (pageScope === 'project') {
      return get(this, 'cluster.name') + '_' + get(this, 'project.name')
    }
    return '';
  }.property('project.name', 'cluster.name'),

  logPreview: function() {
    const index = get(this, 'esIndex');
    const outputTags = get(this, 'outputTags');
    const template = `{
  "_index": "${index}",
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
${outputTags}
  },
  ...
}`;
    return template
  }.property('esIndex', 'outputTags'),

  outputTags: function() {
    const t = get(this, 'targetType');
    const keyValueMap = get(this, 'model.outputTags');
    if (!keyValueMap) {
      return '';
    }
    return Object.keys(keyValueMap).map(key => `    "${key}": "${keyValueMap[key]}"`).join(',\n');
  }.property('model.outputTags'),

  dateFormatString: function() {
    const fmt = this.get('config.dateFormat');
    return moment().format(fmt);
  }.property('config.dateFormat'),

  esIndex: function() {
    return get(this, 'config.indexPrefix') + '-' + get(this, 'dateFormatString');
  }.property('config.indexPrefix', 'dateFormatString'),
});
