import { get, set } from '@ember/object'
import { inject as service } from '@ember/service'
import { alias } from '@ember/object/computed'
import Mixin from '@ember/object/mixin';

const DEFAULT_TARGET_TYPE = 'none';
export default Mixin.create({
  // needs to override this type

  scope: service(),
  globalStore: service(),
  pageScope: alias('scope.currentPageScope'),
  cluster: alias('scope.currentCluster'),
  project: alias('scope.currentProject'),
  modalService: service('modal'),

  kafka: {
    outputTags: null,
    outputFlushInterval: 3,
    config: {
      topic: null,
      // comma separated enpoints string
      brokerEndpoints: null,
      zookeeperEndpoint: null,
    },
  },
  elasticsearch: {
    outputTags: null,
    outputFlushInterval: 3,
    config: {
      authUsername: null,
      authPassword: null,
      dateFormat: 'YYYY-MM-DD',
      indexPrefix: null,
      endpoint: null,
    },
  },
  splunk: {
    outputTags: null,
    outputFlushInterval: 3,
    config: {
      endpoint: null,
      source: null,
      token: null,
    },
  },
  embedded: {
    outputTags: null,
    outputFlushInterval: 3,
    config: {
      dateFormat: 'YYYY-MM-DD',
      indexPrefix: null,
    },
  },
  syslog: {
    outputTags: null,
    outputFlushInterval: 3,
    config: {
      severity: 'info',
      program: null,
      endpoint: null,
      protocol: 'tcp',
    },
  },

  init(...args) {
    this._super(...args);
    const t = get(this, 'targetType');
    if (t && get(this, t)) {
      set(this, `${t}.config`, get(this, `${t}Config`));
      set(this, `${t}.outputFlushInterval`, get(this, 'outputFlushInterval'));
      set(this, `${t}.outputTags`, get(this, 'outputTags'));
    }
  },

  targetType: function() {
    const ed = get(this, 'embeddedConfig');
    const es = get(this, 'elasticsearchConfig');
    const splunk = get(this, 'splunkConfig');
    const kafka = get(this, 'kafkaConfig');
    const syslog = get(this, 'syslogConfig');
    if (ed) {
      return 'embedded';
    }
    if (es) {
      return 'elasticsearch';
    }
    if (splunk) {
      return 'splunk';
    }
    if (syslog) {
      return 'syslog';
    }
    if (kafka) {
      return 'kafka';
    }
    return DEFAULT_TARGET_TYPE;
  }.property('embeddedConfig', 'elasticsearchConfig', 'splunkConfig', 'kafkaConfig', 'syslogConfig'),
});
