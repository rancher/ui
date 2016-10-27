import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import Util from 'ui/utils/util';

export default Ember.Component.extend(NewOrEdit, {
  access: Ember.inject.service(),
  growl: Ember.inject.service(),
  intl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  projectTemplate: null,
  catalogInfo: null,

  stacksMap: null,
  orchestrationIds: null,
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

      this.get('orchestrationIds').forEach((cur) => {
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

    cancel() {
      return this.get('router').transitionTo('settings.projects');
    },
  },

  initMap() {
    let map = {};
    let orch = [];
    let stacks = this.get('projectTemplate.stacks');

    this.get('catalogInfo.catalog').forEach((tpl) => {
      let tplId = tpl.get('id');

      if ( (tpl.get('category')||'').toLowerCase() === 'orchestration')
      {
        orch.push(tpl.get('id'));
      }

      let cur = stacks.findBy('externalIdInfo.templateId', tplId);

       if ( cur ) {
         map[tplId] = Ember.Object.create({
           enabled: true,
           compatible: null,
           tpl: tpl,
           stack: this.get('store').createRecord({
             type: 'stack',
             name: cur.get('name'),
             description: cur.get('description'),
             environment: cur.get('answers'),
             templateVersionId: cur.get('externalId'),
           }),
         });
       } else {
         map[tplId] = Ember.Object.create({
           enabled: false,
           tpl: tpl,
           compatible: null,
           stack: this.get('store').createRecord({
             type: 'stack',
             name: tpl.get('defaultName'),
             environment: {},
           }),
         });
       }
     });

     this.set('stacksMap', map);
     this.set('orchestrationIds', orch);
  },

  initOrchestration() {
    let map = this.get('stacksMap');

    var orch = 'cattle';
    this.get('orchestrationIds').forEach((key) => {
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

  showOrchestrationOrigin: false,
  orchestrationChoices: function() {
    var active = this.get('activeOrchestration');

    var drivers = [
      {name: 'cattle', title: 'Cattle', source: 'Built-In', image: `${this.get('app.baseAssets')}assets/images/logos/provider-orchestration.svg`}
    ];

    let map = this.get('stacksMap');
    let seen = {};
    this.get('orchestrationIds').forEach((id) => {
      let tpl = (map[id]||{}).tpl;
      if ( tpl ) {
        drivers.push({name: id, title: tpl.name, source: 'in ' + Util.ucFirst(tpl.catalogId), image: tpl.links.icon});
        seen[tpl.name] = (seen[tpl.name]||0)+1;
      }
    });

    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    let multiple = Object.keys(seen).map((k) => seen[k]).filter((x) => x > 1).length > 0;
    this.set('showOrchestrationOrigin', multiple);

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
      let orch = this.get('activeOrchestration');
      let ok = true;

      Object.keys(map).forEach((key) => {
        let obj = map[key];
        let tpl = obj.get('tpl');
        if ( obj.enabled && !tpl.supportsOrchestration(orch) ) {
          this.get('growl').error(
            intl.t('editProjectTemplate.error.conflict'),
            intl.t('editProjectTemplate.error.enabling', {
              tplCategory: tpl.get('category'),
              stackName: tpl.get('name'),
              orchestration: Util.ucFirst(orch),
            })
          );

          ok = false;
        }
      });

      return ok;
    }).catch(() => {
      return false;
    });
  },

  doSave() {
    let map = this.get('stacksMap');
    let ary = [];

    // Only look at enabled stacks
    Object.keys(map).forEach((key) => {
      let obj = map[key];
      if ( obj && obj.enabled ) {
        ary.push(obj);
      }
    });

    // Map to the catalogTemplate objects the API wants
    let stacks = ary.map((obj) => {
      let s = obj.stack;
      return {
        name: s.name,
        description: s.description,
        answers: s.environment,
        templateVersionId: obj.tplVersion.id,
      };
    });

    this.set('projectTemplate.stacks', stacks);
    return this._super();
  },

  doneSaving() {
    this.send('cancel');
  }
});
