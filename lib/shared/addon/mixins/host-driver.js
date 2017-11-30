import { next } from '@ember/runloop';
import { resolve, Promise as EmberPromise } from 'rsvp';
import { computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import Util from 'ui/utils/util';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ManageLabels from 'shared/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';
import { get } from '@ember/object';

export default Mixin.create(NewOrEdit, ManageLabels, {
  intl:          service(),
  scope:         service(),
  settings:      service(),
  router:        service(),
  clusterStore:  service('cluster-store'),
  createDelayMs: 0,
  showEngineUrl: true,

  queryParams:   ['hostId'],
  hostId:        null,
  error:         null,

  count:         null,
  prefix:        null,
  clonedModel:   null,
  useHost:       true,
  hostConfig:    null,
  labelResource: alias('model.publicValues'),

  actions: {
    addLabel: addAction('addLabel', '.key'),
    cancel() {
      if (typeOf(this.attrs.goBack) === 'function') {
        this.attrs.goBack();
      }
    },

    goBack() {
      if (typeOf(this.attrs.goBack) === 'function') {
        this.attrs.goBack();
      }
    },
    passConfigBack(cb) {
      this.sendAction('completed', this.get('model'));
      cb(true);
    },

    setLabels(labels) {
      let out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labelResource.labels', out);
    }
  },

  init() {
    this._super(...arguments);

    this.set('error', null);
    this.set('editing', false);

    if (this.get('clonedModel')) {
      this.set('model', this.get('clonedModel'));
      this.set('prefix', '');
    } else if (typeof this.get('bootstrap') === 'function') {
      this.bootstrap();
    }

    // Dynamically guess a decent location and size description.  Individual drivers can override.
    let locationA = ['region'];
    let locationB = ['zone','availabilityZone','location','datacenter'];
    let size = ['instanceType','offering','flavor','size'];
    this.set('displayLocation', computed(
      this.driver+'.{'+locationA.join(',')+'}',
      this.driver+'.{'+locationB.join(',')+'}',
    function() {
      let out = '';
      let config = this.get(this.get('driver'));
      for ( let i = 0 ; i < locationA.length ; i++ ) {
        let key = locationA[i];
        let val = get(config, key);
        if ( val ) {
          out = val;
          break;
        }
      }

      for ( let i = 0 ; i < locationB.length ; i++ ) {
        let key = locationB[i];
        let val = get(config, key);
        if ( val ) {
          out += val;
          break;
        }
      }

      return out;
    }));

    this.set('displaySize', computed(this.driver+'.{'+size.join(',')+'}', function() {
      let config = this.get(this.get('driver'));
      for ( let i = 0 ; i < size.length ; i++ ) {
        let key = size[i];
        let val = get(config, key);
        if ( val ) {
          return val;
        }
      }

      return '';
    }));
  },

  driverSaveAction: computed('inModal', function() {
    if (this.get('inModal')) {
      return 'passConfigBack';
    } else {
      return 'save';
    }
  }),

  nameParts: function() {
    let input = this.get('prefix')||'';
    let count = this.get('count');
    let match = input.match(/^(.*?)([0-9]+)$/);

    if ( count <= 1 )
    {
      return {
        name: input,
      };
    }

    let prefix, minLength, start;
    if ( match && match.length )
    {
      prefix = match[1];
      minLength = (match[2]+'').length;
      start = parseInt(match[2],10);
    }
    else
    {
      prefix = input;
      minLength = 1;
      start = 1;
    }

    // app98 and count = 3 will go to 101, so the minLength should be 3
    let end = start + count - 1;
    minLength = Math.max(minLength, (end+'').length);

    return {
      prefix: prefix,
      minLength: minLength,
      start: start,
      end: end
    };
  }.property('prefix','count'),

  nameCountLabel: function() {
    let parts = this.get('nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      // qty=1 or no input yet, nothing to see here...
      return '';
    }

    let first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
    let last = parts.prefix + Util.strPad(parts.end, parts.minLength, '0');
    return this.get('intl').tHtml('driver.multiHostNames',{first: first, last: last});
  }.property('nameParts','intl.locale'),

  nameDidChange: function() {
    this.set('primaryResource.name', this.get('prefix'));
  }.observes('prefix'),

  defaultDescription: function() {
    let loc = this.get('displayLocation');
    let size = this.get('displaySize');
    if ( loc && size ) {
      return loc + ' / ' + size;
    } else {
      return (loc||'') + (size||'');
    }
  }.property('displayLocation','displaySize'),

  willSave() {
    this.set('primaryResource.clusterId', this.get('cluster.id'));

    if ( this.get('primaryResource.type').toLowerCase() === 'machinetemplate') {
     if ( !this.get('primaryResource.description') ) {
       this.set('primaryResource.description', this.get('defaultDescription'));
     }
    } else {
      this.set('multiTemplate', this.get('primaryResource').clone());
    }

    return this._super();
  },

  validate() {
    let errors = [];

    if ( !this.get('nameParts.prefix') && !this.get('nameParts.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },

  doSave() {
    if ( this.get('primaryResource.type').toLowerCase() === 'machinetemplate' ) {
      return this._super(...arguments);
    } else {
      return resolve(this.get('primaryResource'));
    }
  },

  didSave() {
    let count = this.get('count');
    let parts = this.get('nameParts');
    let delay = this.get('createDelayMs');
    let tpl;

    if ( this.get('primaryResource.type').toLowerCase() === 'machinetemplate') {
      tpl = this.get('clusterStore').createRecord({
        type: 'machine',
        driver: this.get('model.driver'),
        machineTemplateId: this.get('model.id'),
        clusterId: this.get('cluster.id'),
      });

      return addHosts();
    } else {
      // The model was the first one, add subsequent numbers
      tpl = this.get('multiTemplate');
      tpl.set('type', 'machine'); // @@TODO@@ - 11-29-17 - cant find where this is being set to host and need demo
      return addHosts();
    }

    function addHosts() {
      if ( parts.name ) {
        // Single host
        if ( count > 0 ) {
          tpl.set('hostname', parts.name);
          return tpl.save();
        } else {
          return resolve(tpl);
        }
      } else {
        // Multiple hosts
        var promise = new EmberPromise(function(resolve,reject) {
          let hosts = [];
          for ( let i = parts.start ; i <= parts.end ; i++ )
          {
            let host = tpl.clone();
            host.set('name', null);
            host.set('hostname', parts.prefix + Util.strPad(i, parts.minLength, '0'));
            hosts.push(host);
          }

          async.eachSeries(hosts, function(host, cb) {
            host.save().then(() => {
              setTimeout(cb, delay);
            }).catch((err) => {
              cb(err);
            });
          }, function(err) {
            if ( err ) {
              reject(err);
            } else {
              resolve(hosts[0]);
            }
          });
        });

        return promise;
      }
    }
  },

  doneSaving(neu) {
    let out = this._super();
    // let project = this.get('scope.current');
    // let cluster = this.get('clusterStore').all('cluster').findBy('id', neu.clusterId);

    // cluster.reload().then(() => {
    //   if ( project.get('clusterId') !== cluster.get('id') ) {
    //     project = cluster.get('defaultProject');
    //   }

    //   if ( project ) {
    //     this.get('router').send('switchProject', project.get('id'), 'hosts', [project.get('id')]);
    //   } else {
    //     this.get('router').transitionTo('global-admin.clusters');
    //   }

    //   return out;
    // });
    return out;
  },

  didInsertElement() {
    this._super();
    next(() => {
      try {
        let input = this.$('INPUT')[0];
        if ( input )
        {
          input.focus();
        }
      }
      catch(e) {
      }
    });
  },
});
