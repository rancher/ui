import { get } from '@ember/object'
import Mixin from '@ember/object/mixin';

const DEFAULT_TARGET_TYPE = 'none';
export default Mixin.create({
  // needs to override the type props
  type: null,

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
