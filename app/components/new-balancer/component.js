import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

export default Ember.Component.extend(NewOrEdit, {
  intl                      : Ember.inject.service(),
  settings                  : Ember.inject.service(),

  service                   : null,
  editing                   : null,
  existing                  : null,
  allHosts                  : null,
  allCertificates           : null,
  upgradeImage              : null,

  isGlobal                  : null,
  isRequestedHost           : null,
  upgradeOptions            : null,
  hasUnsupportedPorts       : false,

  // Errors from components
  ruleErrors                : null,
  schedulingErrors          : null,
  scaleErrors               : null,

  primaryResource           : Ember.computed.alias('service'),
  launchConfig              : Ember.computed.alias('service.launchConfig'),

  init() {
    this._super(...arguments);
    this.labelsChanged();
    this.get('service').initPorts();
    this.updatePorts();
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

    setUpgrade(upgrade) {
      this.set('upgradeOptions', upgrade);
    },

    setGlobal(bool) {
      this.set('isGlobal', bool);
    },
  },

  headerLabel: function() {
    let k;
    if ( this.get('needsUpgrade') ) {
      k = 'newBalancer.header.upgrade';
    } else if ( this.get('existing') ) {
      k = 'newBalancer.header.edit';
    } else {
      k = 'newBalancer.header.add';
    }

    return this.get('intl').t(k);
  }.property('intl._locale','needsUpgrade','isService','isVm','service.secondaryLaunchConfigs.length'),

  // ----------------------------------
  // Ports
  // ----------------------------------
  updatePorts() {
    let rules = this.get('service.lbConfig.portRules')||[];
    let publish = [];
    let expose = [];

    // Set ports and publish on the launch config
    rules.forEach((rule) => {
      // The inner one eliminates null/undefined, then the outer one
      // converts integers to string (so they can be re-parsed later)
      let srcStr = ((rule.get('sourcePort')||'')+'').trim();
      let src = parseInt(srcStr,10);
      if ( !src || src < 1 || src > 65535 ) {
        return;
      }

      let entry = src+":"+src+"/"+rule.get('ipProtocol');
      if ( rule.get('access') === 'public' ) {
        // Source IP applies only to public rules
        let ip = rule.get('sourceIp');
        if ( ip ) {
          // IPv6
          if ( ip.indexOf(":") >= 0 && ip.substr(0,1) !== '[' ) {
            entry = '['+ip+']:' + entry;
          } else {
            entry = ip + ':' + entry;
          }
        }

        publish.push(entry);
      } else {
        expose.push(entry);
      }
    });

    this.get('service.launchConfig').setProperties({
      ports: publish.uniq(),
      expose: expose.uniq(),
    });
  },

  shouldUpdatePorts: function() {
    Ember.run.once(this,'updatePorts');
  }.observes('service.lbConfig.portRules.@each.{sourceIp,sourcePort,access,protocol}'),


  validateRules() {
    let intl = this.get('intl');
    let rules = this.get('service.lbConfig.portRules');
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
        return;
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
        return;
      }

      let sourceIp = rule.get('sourceIp');
      let key;
      if ( sourceIp ) {
        key = '['+sourceIp+']:' + src;
      } else {
        key = '[0.0.0.0]:' + src;
      }

      let access = rule.get('access');
      let id = access + '-' + rule.get('protocol') + '-' + src;

      if ( seen[key] ) {
        if ( seen[key] !== id ) {
          errors.push(intl.t('newBalancer.error.mixedPort', {num: src}));
        }
      } else {
        seen[key] = id;
      }

      if ( !rule.get('serviceId') && !rule.get('selector') ) {
        errors.push(intl.t('newBalancer.error.noTarget'));
      }

      // Make ports always numeric
      rule.setProperties({
        sourcePort: src,
        targetPort: tgt,
      });
    });

    this.set('ruleErrors', errors);
  },

  needsUpgrade: function() {
    function arrayToStr(map) {
      map = map || {};
      let out = [];
      let keys = Object.keys(map);
      keys.sort();
      keys.forEach((key) => {
        out.push(key + '=' + map[key]);
      });

      return JSON.stringify(out);
    }

    function removeKeys(map,keys) {
      map = map || {};
      keys.forEach((key) => {
        delete map[key];
      });

      return map;
    }

    if ( !this.get('editing') )
    {
      return false;
    }

    if ( this.get('upgradeImage')+'' === 'true' ) {
      return true;
    }

    // Label arrays are updated one at a time and make this flap,
    // so ignore them until they're all set
    if ( !this.get('labelsReady') ) {
      return false;
    }

    let old = removeKeys(this.get('existing.launchConfig.labels'),C.LABELS_TO_IGNORE);
    let neu = removeKeys(this.get('service.launchConfig.labels'),C.LABELS_TO_IGNORE);
    return arrayToStr(old) !== arrayToStr(neu);
  }.property(
    'editing',
    'upgradeImage',
    'service.launchConfig.labels'
  ),

  upgradeInfo: function() {
    let from = (this.get('existing.launchConfig.imageUuid')||'').replace(/^docker:/,'');
    let to = (this.get('service.launchConfig.imageUuid')||'').replace(/^docker:/,'');

    if ( this.get('upgradeImage')+'' === 'true' ) {
      return Ember.Object.create({
        from: from,
        to: to,
      });
    }
  }.property('existing.launchConfig.imageUuid','service.launchConfig.imageUuid'),

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,
  labelsReady: false,

  labelsChanged: function() {
    Ember.run.once(this,'mergeLabels');
  }.observes(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}'
  ),

  mergeLabels() {
    let user = this.get('userLabels');
    let scale = this.get('scaleLabels');
    let scheduling = this.get('schedulingLabels');
    var out = {};

    (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
    (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
    (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });

    var config = this.get('launchConfig');
    if ( config )
    {
      this.set('launchConfig.labels', out);
    }

    this.set('labelsReady', user && scale && scheduling);
  },

  editLabel: function() {
    return (this.get('needsUpgrade') ? 'action.upgrade' : 'action.edit');
  }.property('needsUpgrade'),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave() {
    this.validateRules();
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

    if ( this.get('service.lbConfig.needsCertificate') && !this.get('service.lbConfig.defaultCertificateId')) {
      errors.push(intl.t('newBalancer.error.needsCertificate'));
    } else if ( !this.get('service.lbConfig.needsCertificate') ) {
      this.set('service.lbConfig.defaultCertificateId', null);
      this.set('service.lbConfig.certificateIds', []);
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

  doSave() {
    if ( this.get('editing') )
    {
      let service = this.get('service');
      return this._super.apply(this,arguments).then(() => {
        if ( this.get('needsUpgrade') ) {
          return service.waitForAction('upgrade').then(() => {
            return service.doAction('upgrade', {
              inServiceStrategy: {
                batchSize: this.get('upgradeOptions.batchSize'),
                intervalMillis: this.get('upgradeOptions.intervalMillis'),
                startFirst: this.get('upgradeOptions.startFirst'),
                launchConfig: service.get('launchConfig'),
              },
            });
          });
        }
      });
    }
    else
    {
      return this._super.apply(this,arguments);
    }
  },

  doneSaving() {
    this.send('done');
  },
});
