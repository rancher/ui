import { get, set, computed, setProperties } from '@ember/object'
import EmberObject from '@ember/object';
import Mixin from '@ember/object/mixin';

const DEFAULT_TARGET_TYPE = 'none';

export default Mixin.create({
  // needs to override the type props
  type: null,

  patch() {
    const t = this.targetType;
    const store = this.store;

    const nue = store.createRecord({ type: this.type, });

    const map = EmberObject.create({});

    const loggingTagets = [
      'kafka',
      'elasticsearch',
      'splunk',
      'syslog',
      'fluentForwarder',
      'customTarget',
    ];

    loggingTagets.forEach((key) => {
      let config

      if (key === 'fluentForwarder') {
        config = store.createRecord({ type: `fluentForwarderConfig`, });
      } else if (key === 'customTarget') {
        config = store.createRecord({ type: `customTargetConfig`, });
        setProperties(config, {
          clientKey:   '',
          clientCert:  '',
          certificate: '',
          content:     `<match *>
  @type elasticsearch

</match>`,
        })
      } else {
        config = store.createRecord({ type: `${ key }Config`, });
      }

      nue.set('config', config);
      set(map, key, nue.clone());
    });

    this.setProperties(map);
    if (t && t !== 'none') {
      setProperties(this, {
        [`${ t }.config`]:                 get(this, `${ t }Config`),
        [`${ t }.outputFlushInterval`]:    get(this, `outputFlushInterval`),
        [`${ t }.outputTags`]:             get(this, `outputTags`),
        [`${ t }.dockerRootDir`]:          this.dockerRootDir,
        [`${ t }.includeSystemComponent`]: this.includeSystemComponent,
      })
    }

    return this;
  },

  targetType: computed('elasticsearchConfig', 'splunkConfig', 'kafkaConfig', 'syslogConfig', 'fluentForwarderConfig', 'customTargetConfig', function() {
    const {
      customTargetConfig, elasticsearchConfig, splunkConfig, syslogConfig, kafkaConfig, fluentForwarderConfig
    } = this

    if (customTargetConfig) {
      return 'customTarget'
    }
    if (elasticsearchConfig) {
      return 'elasticsearch';
    }
    if (splunkConfig) {
      return 'splunk';
    }
    if (syslogConfig) {
      return 'syslog';
    }
    if (kafkaConfig) {
      return 'kafka';
    }
    if (fluentForwarderConfig) {
      return 'fluentForwarder'
    }

    return DEFAULT_TARGET_TYPE;
  }),

  sslTargetType: computed('elasticsearchConfig', 'splunkConfig', 'kafkaConfig', 'syslogConfig', 'fluentForwarderConfig', function() {
    const es = this.elasticsearchConfig;
    const splunk = this.splunkConfig;
    const kafka = this.kafkaConfig;
    const syslog = this.syslogConfig;
    const fluentd = this.fluentForwarderConfig;

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
    if (fluentd) {
      return 'fluentForwarder'
    }

    return DEFAULT_TARGET_TYPE;
  }),
});
