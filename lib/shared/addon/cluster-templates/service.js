import Service from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';

export default Service.extend({
  globalStore:      service(),
  questionsSchemas: null,

  fetchQuestionsSchema() {
    if (!this.questionsSchemas) {
      return this.globalStore.rawRequest({
        url:    'clusterTemplateRevisions?action=listquestions',
        method: 'POST',
      }).then((resp) => {
        if (resp.body) {
          let parsed = JSON.parse(resp.body);

          set(this, 'questionsSchemas', get(parsed, 'questions'));
        }
      });
    }
  },

  cloneAndPopulateClusterConfig(cluster, clusterTemplateRevision) {
    let clusterConfig = clusterTemplateRevision.clusterConfig.cloneForNew();

    delete clusterConfig.type;

    setProperties(cluster, clusterConfig);
  },
});
