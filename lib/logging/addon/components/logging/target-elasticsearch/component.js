import Component from '@ember/component';
import es from 'logging/mixins/target-elasticsearch';
import { get } from '@ember/object';

export default Component.extend(es, {

  indexFormat: function()  {
    const ps = get(this, 'pageScope');
    return ps === 'cluster' ? '${clusterName}-${dateFormat}' : '${clusterName}_${projectName}-${dateFormat}';
  }.property('pageScope'),
});
