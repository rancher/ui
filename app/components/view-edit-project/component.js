import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import NewOrEdit from 'ui/mixins/new-or-edit';
import Util from 'ui/utils/util';

const ORCH_TEMPLATES = [
  C.EXTERNAL_ID.ID_K8S,
  C.EXTERNAL_ID.ID_SWARM,
  C.EXTERNAL_ID.ID_MESOS
];

export default Ember.Component.extend(NewOrEdit, Sortable, {
  catalogService: Ember.inject.service('catalog-service'),
  projects: Ember.inject.service(),
  access: Ember.inject.service(),
  growl: Ember.inject.service(),
  accessEnabled: Ember.computed.alias('access.enabled'),
  queryParams: ['editing'],

  project: null,
  originalProject: null,
  allProjects: null,
  catalogTemplates: null,
  initialStacks: null,
  serviceChoices: null,
  editing: false,
  tab: 'access',

  primaryResource: Ember.computed.alias('project'),
  sortableContent: Ember.computed.alias('project.projectMembers'),
  sortBy: 'name',
  sorts: {
    name:   ['externalId'],
    type:   ['externalIdType','externalId'],
    role:   ['role','externalId'],
  },

  stacks: null,

  actions: {
    changeProject(project) {
      this.get('router').transitionTo('settings.projects.detail', project.get('id'));
    },

    cancel() {
      this.sendAction('cancel');
    },

    checkMember(member) {
      var existing = this.get('project.projectMembers')
                      .filterBy('externalIdType', member.get('externalIdType'))
                      .filterBy('externalId', member.get('externalId'));

      if ( existing.get('length') )
      {
        this.send('error','Member is already in the list');
        return;
      }

      member.set('role', (this.get('hasOwner') ? 'member' : 'owner'));

      this.send('error',null);
      this.get('project.projectMembers').pushObject(member);
    },

    removeMember(item) {
      this.get('project.projectMembers').removeObject(item);
    },

    selectOrchestration(id) {
      let stacks = this.get('stacks');
      let keys = Object.keys(stacks);

      for ( let i = 0 ; i < keys.length ; i++ ) {
        let obj = stacks[keys[i]];
        let tpl = obj.get('tpl');
        if ( obj.get('enabled') && tpl && !tpl.supportsOrchestration(id) ) {
          let orch = stacks[id].get('tpl.name');
          this.get('growl').error('Conflict','The currently enabled '+ tpl.get('category') +' stack "'+ tpl.get('name') +'" does not support '+ orch +' Orchestration.');
          return;
        }
      }

      ORCH_TEMPLATES.forEach((cur) => {
        if ( stacks[cur] ) {
          stacks[cur].set('enabled', id === cur);
        }
      });

      this.set('activeOrchestration', id);
      this.updateSupported();
    },

    enableStack(obj) {
      this.get('application').setProperties({
        catalogConfigure: true,
        serviceChoices: this.get('serviceChoices'),
        originalModel: obj,
      });
    },

    disableStack(obj) {
      obj.set('enabled', false);
    },
  },

  init() {
    this._super(...arguments);
    this.initStacks();
    this.initOrchestration();
    this.updateSupported();
  },

  activeOrchestration: null,

  didInsertElement() {
    if ( this.get('showEdit') )
    {
      var elem = this.$('INPUT[type="text"]')[0];
      if ( elem )
      {
        elem.focus();
      }
    }
  },

  projectBase: function() {
    return this.get('app.projectEndpoint').replace(this.get('app.projectToken'), this.get('project.id'));
  }.property('project.id'),

  initStacks() {
    let stacks = {};
    let enabled = this.get('initialStacks')||[];
    this.get('catalogTemplates').forEach((tpl) => {
      let tplId = tpl.get('id');
      let cur = enabled.findBy('externalIdInfo.templateId', tplId);
      if ( cur ) {
        stacks[tplId] = Ember.Object.create({
          enabled: true,
          compatible: false,
          tpl: tpl,
          stack: cur,
          changed: false,
        });
      } else {
        stacks[tplId] = Ember.Object.create({
          enabled: false,
          tpl: tpl,
          changed: false,
          compatible: false,
          stack: this.get('userStore').createRecord({
            type: 'stack',
            accountId: this.get('project.id'),
            name: tpl.get('defaultName'),
            system: true,
            environment: {},
            startOnCreate: true,
          }),
        });
      }
    });

    ORCH_TEMPLATES.forEach((key) => {
      if ( !stacks[key]) {
        stacks[key] = Ember.Object.create({
          enabled: false
        });
      }
    });

    this.set('stacks', stacks);
  },

  initOrchestration() {
    let stacks = this.get('stacks');

    var orch = 'cattle';
    ORCH_TEMPLATES.forEach((key) => {
      if ( stacks[key] && Ember.get(stacks[key],'enabled') ) {
        orch = key;
      }
    });

    this.set('activeOrchestration', orch);
  },

  updateSupported() {
    let stacks = this.get('stacks');
    let orch = this.get('activeOrchestration');

    Object.keys(stacks).forEach((cur) => {
      let obj = stacks[cur];
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
    let out = this.get('catalogTemplates').map(tpl => tpl.category).uniq().sort();
    out.removeObject('Orchestration');
    return out;
  }.property('catalogTemplates.@each.category'),

  roleOptions: function() {
    return (this.get('userStore').getById('schema','projectmember').get('resourceFields.role.options')||[]).map((role) => {
      return {
        label: 'model.projectMember.role.'+role,
        value: role
      };
    });
  }.property(),

  hasOwner: function() {
    return this.get('project.projectMembers').filterBy('role', C.PROJECT.ROLE_OWNER).get('length') > 0;
  }.property('project.projectMembers.@each.role'),

  orchestrationChoices: function() {
    var active = this.get('activeOrchestration');

    var drivers = [
      {name: 'cattle',     label: 'Cattle',      css: 'cattle'}
    ];

    let stacks = this.get('stacks');
    if ( stacks[C.EXTERNAL_ID.ID_K8S].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_K8S, label: 'Kubernetes',  css: 'kubernetes'});
    }

    if ( stacks[C.EXTERNAL_ID.ID_MESOS].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_MESOS,  label: 'Mesos',       css: 'mesos'});
    }

    if ( stacks[C.EXTERNAL_ID.ID_SWARM].tpl ) {
      drivers.push({name: C.EXTERNAL_ID.ID_SWARM,  label: 'Swarm',       css: 'swarm'});
    }

    drivers.forEach(function(driver) {
      driver.active = ( active === driver.name );
    });

    return drivers;
  }.property('activeOrchestration'),

  validate() {
    this._super();
    var errors = this.get('errors')||[];

    if ( !this.get('hasOwner') && this.get('access.enabled') )
    {
      errors.push('You must have at least one owner');
    }

    if ( errors.length )
    {
      this.set('errors', errors);
      return false;
    }

    return true;
  },

  willSave() {
    var out = this._super();
    if ( out && !this.get('project.id') )
    {
      // For create the members go in the request
      this.set('project.members', this.get('project.projectMembers'));
    }

    return this.defaultTemplateVersions().then(() => {
      let stacks = this.get('stacks');
      let enabled = Object.keys(stacks).filterBy('enabled',true);
      let orch = this.get('activeOrchestration');
      for ( let i = 0 ; i < enabled.length ; i++ ) {
        let obj = stacks[enabled[i]];
        let tpl = obj.get('tpl');
        if ( !tpl.supportsOrchestration(orch) ) {
          this.get('growl').error('Conflict','The selected version of ' + tpl.get('category') + ' stack "'+tpl.get('name')+'" does not support ' + Util.ucFirst(orch) + ' Orchestration.');
          return false;
        }
      }

      return out;
    }).catch(() => {
      return false;
    });
  },

  didSave() {
    if ( this.get('editing') && this.get('access.enabled') )
    {
      var members = this.get('project.projectMembers').map((member) => {
        return {
          type: 'projectMember',
          externalId: member.externalId,
          externalIdType: member.externalIdType,
          role: member.role
        };
      });

      return this.get('project').doAction('setmembers',{members: members}).then(() => {
        return this.saveStacks();
      });
    }
    else
    {
      return this.saveStacks();
    }
  },

  defaultTemplateVersions() {
    let promises = [];
    let stacks = this.get('stacks');
    Object.keys(stacks).forEach((key) => {
      let stack = stacks[key];
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

  saveStacks() {
    let promises = [];

    let stacks = this.get('stacks');
    Object.keys(stacks).forEach((key) => {
      let obj = stacks[key];
      let stack = obj.get('stack');
      let version = obj.get('tplVersion');
      if ( stack.get('id') ) {
        if ( obj.get('enabled') ) {
          if ( version && obj.get('changed') ) {
            // Upgrade
            promises.push(stack.doAction('upgrade', {
              dockerCompose: version.get('files')['docker-compose.yml'],
              rancherCompose: version.get('files')['rancher-compose.yml'],
              environment: stack.get('environment'),
              externalId: C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + version.get('id'),
            }, {url: this.get('projectBase')+'/stacks'+stack.get('id')+'?action=upgrade'}));
          }
        } else {
          // Remove
          promises.push(stack.delete({url: this.get('projectBase')+'/stacks/'+stack.get('id')}));
        }
      } else if ( obj.get('enabled') && obj.get('tplVersion') ) {
        // Create
        let version = obj.get('tplVersion');
        stack.setProperties({
          dockerCompose: version.get('files')['docker-compose.yml'],
          rancherCompose: version.get('files')['rancher-compose.yml'],
          environment: stack.get('environment'),
          externalId: C.EXTERNAL_ID.KIND_SYSTEM_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + version.get('id'),
        });
        promises.push(stack.save({url: this.get('projectBase')+'/stacks'}));
      }
    });

    return Ember.RSVP.all(promises);
  },

  doneSaving() {
    var out = this._super();
    this.get('projects').refreshAll();
    this.sendAction('done');
    return out;
  },
});
