import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Component.extend(NewOrEdit, {
  intl                      : Ember.inject.service(),
  settings                  : Ember.inject.service(),

  service                   : null,

  existing                  : null,
  allHosts                  : null,
  allServices               : null,
  allCertificates           : null,

  isGlobal                  : null,
  isRequestedHost           : null,
  portsAsStrArray           : null,

  // Errors from components
  ruleErrors                : null,
  schedulingErrors          : null,
  scaleErrors               : null,
  portErrors                : null,

  primaryResource           : Ember.computed.alias('service'),
  launchConfig              : Ember.computed.alias('service.launchConfig'),

  init() {
    this._super(...arguments);
    this.labelsChanged();
  },

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    setScale(scale) {
      this.set('service.scale', scale);
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setGlobal(bool) {
      this.set('isGlobal', bool);
    },
  },

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    function() {
      var out = {};

      (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave() {
    let intl = this.get('intl');
    let rules = this.get('service.lbConfig.portRules');
    let publish = [];
    let expose = [];
    let errors = [];
    let seen = {};

    // Set ports and publish on the launch config
    // And also do a bunch of validation while we're here
    rules.forEach((rule) => {
      // The inner one eliminates null/undefined, then the outer one
      // converts integers to string (so they can be re-parsed later)
      let srcStr = ((rule.get('sourcePort')||'')+'').trim();
      let tgtStr = ((rule.get('targetPort')||'')+'').trim();

      if ( !srcStr ) {
        errors.push(intl.t('newBalancer.error.noSourcePort'));
      }

      let src = parseInt(srcStr,10);
      if ( !src || src < 1 || src > 65535 ) {
        errors.push(intl.t('newBalancer.error.invalidSourcePort', {num: srcStr}));
      } else if ( !tgtStr ) {
        tgtStr = srcStr;
      }

      let tgt = parseInt(tgtStr,10);
      if ( !tgt || tgt < 1 || tgt > 65535 ) {
        errors.push(intl.t('newBalancer.error.invalidTargetPort', {num: tgtStr}));
      }

      let access = rule.get('access');
      let entry = src+":"+src+"/"+rule.get('ipProtocol');
      let id = 'rule-' + access + '-' + rule.get('protocol') + '-' + src;

      if ( seen[src] ) {
        if ( seen[src] !== id ) {
          errors.push(intl.t('newBalancer.error.mixedPort', {num: src}));
        }
      } else {
        seen[src] = id;
        if ( access === 'public' ) {
          publish.push(entry);
        } else {
          expose.push(entry);
        }
      }

      if ( !rule.get('serviceId') && !rule.get('selector') ) {
        errors.push(intl.t('newBalancer.error.noTarget'));
      }

      rule.setProperties({
        sourcePort: src,
        targetPort: tgt,
      });
    });

    this.get('service.launchConfig').setProperties({
      ports: publish,
      expose: expose,
    });

    this.set('ruleErrors', errors);

    return this._super();
  },

  validate: function() {
    let intl = this.get('intl');

    var errors = [];
    // Errors from components
    errors.pushObjects(this.get('ruleErrors')||[]);
    errors.pushObjects(this.get('schedulingErrors')||[]);
    errors.pushObjects(this.get('scaleErrors')||[]);

    if (!this.get('service.launchConfig.ports.length') && !this.get('service.launchConfig.expose.length') )
    {
      errors.push(intl.t('newBalancer.error.noRules'/*just right*/));
    }

    if ( this.get('service.lbConfig.needsCertificate') && !this.get('service.lbConfig.certificateId')) {
      errors.push(intl.t('newBalancer.error.needsCertificate'));
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    // Generic validation
    this._super();
    errors = this.get('errors')||[];

    errors.pushObjects(this.get('service').validationErrors());

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  doneSaving() {
    this.send('done');
  },
});
