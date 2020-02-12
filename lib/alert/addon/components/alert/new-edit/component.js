import Component from '@ember/component';
import { reads, alias } from '@ember/object/computed';
import { get, set, observer } from '@ember/object'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service'
import { all as PromiseAll } from 'rsvp';
import AlertRule from 'alert/mixins/alert-rule';

export default Component.extend(NewOrEdit, AlertRule, {
  router:       service(),
  intl:         service(),
  globalStore:  service(),
  scope:        service(),
  showAdvanced: false,
  errors:       null,
  pods:         null,
  workloads:    null,
  for:          null,

  pageScope:  reads('scope.currentPageScope'),
  newAlert:    alias('resourceMap.newAlert'),
  metrics:    alias('resourceMap.metrics'),
  alertGroup:    alias('resourceMap.alertGroup'),
  alertRules:    alias('resourceMap.alertRules'),
  mode:       alias('resourceMap.mode'),
  level:      alias('resourceMap.level'),

  init() {
    this._super(...arguments);
    if (get(this, 'for') === 'security-scan') {
      set(this, 'alertRules.firstObject._targetType', 'cisScan');
    }
  },

  actions: {
    showAdvanced() {
      this.set('showAdvanced', true);
    },

    save(cb) {
      set(this, 'errors', null);
      const ps = get(this, 'pageScope');
      let toSaveAlert;

      if (ps === 'cluster') {
        toSaveAlert = get(this, 'alertGroup').clone()
        set(toSaveAlert, 'clusterId', get(this, 'scope.currentCluster.id'))
      } else {
        toSaveAlert = get(this, 'alertGroup').clone()
        set(toSaveAlert, 'projectId', get(this, 'scope.currentProject.id'))
      }

      get(this, 'alertRules').map((a) => {
        if (ps === 'cluster') {
          this.beforeSaveClusterAlert(a, toSaveAlert)
        } else {
          this.beforeSaveProjectAlert(a, toSaveAlert)
        }
      })

      if (get(this, 'errors') && get(this, 'errors').length > 0) {
        cb();

        return;
      }

      toSaveAlert = this.willSaveMetricRule(toSaveAlert)

      set(toSaveAlert, 'recipients', (get(toSaveAlert, 'recipients') || []).filter((r) => !!r.notifierId));
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

  initialWaitSecondsObersver: observer('newAlert._targetType', 'newAlert.eventRule.resourceKind', function(){
    const rk = get(this, 'newAlert.eventRule.resourceKind');
    const t = get(this, 'newAlert._targetType');

    if (t === 'normalEvent' && rk === 'Pod') {
      set(this, 'newAlert.initialWaitSeconds', 1)
    }
  }),

  didSave(group) {
    const ps = get(this, 'pageScope');
    const alertRules = get(this, 'alertRules').map((a) => {
      let newAlert = {}

      if (ps === 'cluster') {
        newAlert = this.beforeSaveClusterAlert(a, group)
      } else {
        newAlert = this.beforeSaveProjectAlert(a, group)
      }

      return newAlert
    })

    return PromiseAll(alertRules.map((a) => a.save()))
  },

  doneSaving() {
    this.send('cancel');
  },

});
