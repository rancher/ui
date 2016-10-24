import Ember from 'ember';
import C from 'ui/utils/constants';
import NewOrEdit from 'ui/mixins/new-or-edit';
import Util from 'ui/utils/util';

const ORCH_TEMPLATES = [
  C.EXTERNAL_ID.ID_K8S,
  C.EXTERNAL_ID.ID_SWARM,
  C.EXTERNAL_ID.ID_MESOS
];

export default Ember.Component.extend(NewOrEdit, {
  growl: Ember.inject.service(),
  intl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  projectTemplate: null,
  catalogInfo: null,

  stacksMap: null,
  activeOrchestration: null,
  primaryResource: Ember.computed.alias('projectTemplate'),
  editing: Ember.computed.notEmpty('projectTemplate.id'),

  onInit: function() {
    this.initMap();
    this.initOrchestration();
    this.updateSupported();
  }.on('init'),

  actions: {
    selectOrchestration(id) {
      let intl = this.get('intl');
      let map = this.get('stacksMap');
      let keys = Object.keys(map);

      for ( let i = 0 ; i < keys.length ; i++ ) {
        let obj = map[keys[i]];
        let tpl = obj.get('tpl');
        if ( obj.get('enabled') && tpl && !tpl.supportsOrchestration(id) ) {
          let orch = map[id].get('tpl.name');
          this.get('growl').error(
            intl.t('editProjectTemplate.error.conflict'),
            intl.t('editProjectTemplate.error.changing', {
              tplCategory: tpl.get('category'),
              stackName: tpl.get('name'),
              orchestration: Util.ucFirst(orch),
            })
          );
          return;
        }
      }

      ORCH_TEMPLATES.forEach((cur) => {
        if ( map[cur] ) {
          map[cur].set('enabled', id === cur);
        }
      });

      this.set('activeOrchestration', id);
      this.updateSupported();
    },

    editOrchestration() {
      let id = this.get('activeOrchestration');
      let obj = this.get('stacksMap')[id];
      this.send('enableStack', obj);
    },

    enableStack(obj) {
      this.get('modalService').toggleModal('catalog-configure', {
        serviceChoices: this.get('serviceChoices'),
        originalModel: obj,
      });
    },

    disableStack(obj) {
      obj.set('enabled', false);
    },
  },

  initMap() {
    let map = {};
    let stacks = this.get('projectTemplate.stacks');

    this.get('catalogInfo.catalog').forEach((tpl) => {
      let tplId = tpl.get('id');
      let cur = stacks.findBy('externalIdInfo.templateId', tpl.get('id'));
       if ( cur ) {
         map[tplId] = Ember.Object.create({
           enabled: true,
           compatible: null,
           tpl: tpl,
           stack: cur,
           changed: false,
         });
       } else {
         map[tplId] = Ember.Object.create({
           enabled: false,
           tpl: tpl,
           compatible: null,
           stack: this.get('store').createRecord({
             type: 'stack',
             name: tpl.get('defaultName'),
             system: true,
             environment: {},
             startOnCreate: true,
           }),
         });
       }
     });

     this.set('stacksMap', map);
  },

  initOrchestration() {
    let map = this.get('stacksMap');

    var orch = 'cattle';
    ORCH_TEMPLATES.forEach((key) => {
      if ( map[key] && Ember.get(map[key],'enabled') ) {
        orch = key;
      }
    });

    this.set('activeOrchestration', orch);
  },

  updateSupported() {
    let map = this.get('stacksMap');
    let orch = this.get('activeOrchestration');

    Object.keys(map).forEach((cur) => {
      let obj = map[cur];
      if (!obj) {
        return;
      }
      let tpl = obj.get('tpl');
      if (!tpl) {
        return;
      }

      let supported = tpl.supportsOrchestration(orch);
      obj.set('supported', supported);
    });
  },

  categories: function() {
    let out = this.get('catalogInfo.catalog').map(tpl => tpl.category).uniq().sort();
    out.removeObject('Orchestration');
    return out;
  }.property('catalogInfo.catalog.@each.category'),

  orchestrationChoices: function() {
    var active = this.get('activeOrchestration');

    var drivers = [
      {name: 'cattle', label: 'Cattle', css: 'cattle'}
    ];

    let map = this.get('stacksMap');
    if ( map[C.EXTERNAL_ID.ID_K8S].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_K8S, label: 'Kubernetes', css: 'kubernetes'});
    }

    if ( map[C.EXTERNAL_ID.ID_MESOS].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_MESOS, label: 'Mesos', css: 'mesos'});
    }

    if ( map[C.EXTERNAL_ID.ID_SWARM].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_SWARM, label: 'Swarm', css: 'swarm'});
    }

    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return drivers;
  }.property('activeOrchestration'),

  applyDefaultTemplateVersions() {
    let promises = [];
    let map = this.get('stacksMap');
    Object.keys(map).forEach((key) => {
      let stack = map[key];
      if ( stack && stack.get('enabled') && !stack.get('tplVersion') ) {
        let tpl = stack.get('tpl');
        promises.push(
          this.get('store').request({url: tpl.versionLinks[tpl.defaultVersion]}).then((tplVersion) => {
            stack.set('tplVersion', tplVersion);
          })
        );
      }
    });

    return Ember.RSVP.all(promises);
  },

  willSave() {
    let intl = this.get('intl');

    var out = this._super();
    if ( !out ) {
      return out;
    }

    return this.applyDefaultTemplateVersions().then(() => {
      let map = this.get('stacksMap');
      let enabled = Object.keys(map).filterBy('enabled',true);
      let orch = this.get('activeOrchestration');
      for ( let i = 0 ; i < enabled.length ; i++ ) {
        let obj = map[enabled[i]];
        let tpl = obj.get('tpl');
        if ( !tpl.supportsOrchestration(orch) ) {
          this.get('growl').error(
            intl.t('editProjectTemplate.error.conflict'),
            intl.t('editProjectTemplate.error.enabling', {
              tplCategory: tpl.get('category'),
              stackName: tpl.get('name'),
              orchestration: Util.ucFirst(orch),
            })
          );
          return false;
        }
      }

      return out;
    }).catch(() => {
      return false;
    });
  },

  doSave() {
    let ary = [];
    let map = this.get('stacksMap');
    Object.keys(map).forEach((key) => {
      let obj = map[key];
      if ( obj && obj.enabled ) {
        ary.push(obj.stack);
      }
    });

    this.set('projectTemplate.stacks', ary);
    return this._super();
  }
});
