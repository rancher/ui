import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { uniqKeys, ucFirst } from 'ui/utils/util';
import { isAlternate } from 'ui/utils/platform';

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
              orchestration: ucFirst(orch),
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
      let url = 'default';
      if ( obj.stack.templateVersionId ) {
        url = null;
      }

      this.get('modalService').toggleModal('catalog-configure', {
        serviceChoices: this.get('serviceChoices'),
        originalModel: obj,
        selectedTemplateUrl: url
      });
    },

    disableStack(obj, onlyAlternate) {
      if ( onlyAlternate && !isAlternate(event) ) {
        return false;
      }

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
      let categories = tpl.get('categoryLowerArray');

      if ( categories.includes('orchestration') )
      {
        orch.push(tpl.get('id'));
      }

      let cur = stacks.findBy('externalIdInfo.templateId', tplId);
      let required = categories.includes('framework');

      if ( cur ) {
        map[tplId] = Ember.Object.create({
          required: required,
          enabled: true,
          compatible: null,
          tpl: tpl,
          stack: cur.clone(),
        });
      } else {
        map[tplId] = Ember.Object.create({
          required: required,
          enabled: false,
          tpl: tpl,
          compatible: null,
          stack: this.get('store').createRecord({
            type: 'catalogTemplate',
            name: tpl.get('defaultName'),
            answers: {},
            templateId: tplId,
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
    let out = [];
    this.get('catalogInfo.catalog').forEach((obj) => { out.pushObjects(obj.get('categoryArray')); });
    out = uniqKeys(out);

    out.removeObject('Orchestration');

    if ( out.includes('Framework') ) {
      // Move to the bottom
      out.removeObject('Framework');
      out.push('Framework');
    }
    return out;
  }.property('catalogInfo.catalog.@each.categoryArray'),

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
        drivers.push({name: id, title: tpl.name, source: 'in ' + ucFirst(tpl.catalogId), image: tpl.links.icon});
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

  willSave() {
    let intl = this.get('intl');

    var out = this._super();
    if ( !out ) {
      return out;
    }

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
            tplCategory: tpl.get('categoryArray.firstObject'),
            stackName: tpl.get('name'),
            orchestration: ucFirst(orch),
          })
        );

        ok = false;
      }
    });

    return ok;
  },

  doSave() {
    let map = this.get('stacksMap');
    let ary = [];

    // only look at enabled stacks
    Object.keys(map).forEach((key) => {
      let obj = map[key];
      if ( obj && obj.enabled ) {
        let stack = obj.stack;
        if ( stack.templateVersionId ) {
          delete stack.templateId;
        } else {
          delete stack.templateVersionId;
        }

        ary.push(obj.stack);
      }
    });

    this.set('projectTemplate.stacks', ary);
    return this._super();
  },

  doneSaving() {
    this.send('cancel');
  }
});
