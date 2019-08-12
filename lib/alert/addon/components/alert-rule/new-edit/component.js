import Component from '@ember/component';
import { reads, alias } from '@ember/object/computed';
import { get, set } from '@ember/object'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service'
import AlertRule from 'alert/mixins/alert-rule';

export default Component.extend(NewOrEdit, AlertRule, {
  router:            service(),
  intl:              service(),
  globalStore:       service(),
  scope:             service(),

  showAdvanced:      false,
  errors:            null,
  pods:              null,
  workloads:         null,

  pageScope:  reads('scope.currentPageScope'),
  newAlert:   alias('resourceMap.newAlert'),
  metrics:    alias('resourceMap.metrics'),
  alertGroup: alias('resourceMap.alertGroup'),
  alertRule:  alias('resourceMap.alertRule'),
  mode:       alias('resourceMap.mode'),
  level:      alias('resourceMap.level'),

  actions: {
    save(cb) {
      set(this, 'errors', null);
      const ps = get(this, 'pageScope');
      let toSaveAlert;
      const alertRule = get(this, 'alertRule')
      const alertGroup = get(this, 'alertGroup')

      if (ps === 'cluster') {
        toSaveAlert = this.beforeSaveClusterAlert(alertRule, alertGroup);
      } else {
        toSaveAlert = this.beforeSaveProjectAlert(alertRule, alertGroup);
      }
      if (get(this, 'errors') && get(this, 'errors').length > 0) {
        cb();

        return;
      }

      toSaveAlert = this.willSaveMetricRule(toSaveAlert)

      set(this, 'primaryResource', toSaveAlert);
      this._super(cb);
    },

    cancel() {
      const ps = get(this, 'pageScope');
      const router = get(this, 'router');

      if (ps === 'cluster') {
        router.transitionTo('authenticated.cluster.alert.index');
      } else {
        router.transitionTo('authenticated.project.alert.index');
      }
    },
  },

  doneSaving() {
    this.send('cancel');
  },

});
