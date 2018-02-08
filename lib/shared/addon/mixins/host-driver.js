import { next } from '@ember/runloop';
import { resolve, Promise as EmberPromise } from 'rsvp';
import { computed, observer } from '@ember/object';
import { typeOf } from '@ember/utils';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import Util from 'ui/utils/util';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ManageLabels from 'shared/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';
import { get, set, setProperties } from '@ember/object';
import { on } from '@ember/object/evented';

export default Mixin.create(NewOrEdit, ManageLabels, {
  intl:          service(),
  scope:         service(),
  settings:      service(),
  router:        service(),
  globalStore:   service(),
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
  labelResource: alias('model'),
  requestedClusterId:  null,
  role: null,

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
      this.sendAction('completed', get(this, 'model'));
      cb(true);
    },

    setLabels(labels) {
      let out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'labelResource.labels', out);
    }
  },

  init() {
    this._super(...arguments);

    setProperties(this, {
      error: null,
      editing: false
    });

    if (get(this, 'clonedModel')) {
      setProperties(this, {
        model: get(this, 'clonedModel'),
        prefix: '',
      });
    } else if (typeof get(this, 'bootstrap') === 'function') {
      this.bootstrap();
    }

    // Dynamically guess a decent location and size description.  Individual drivers can override.
    let locationA = ['region'];
    let locationB = ['zone','availabilityZone','location','datacenter'];
    let size = ['instanceType','offering','flavor','size'];
    set(this, 'displayLocation', computed(
      this.driver+'.{'+locationA.join(',')+'}',
      this.driver+'.{'+locationB.join(',')+'}',
    function() {
      let out = '';
      let config = get(this, get(this, 'driver'));
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

    set(this, 'displaySize', computed(this.driver+'.{'+size.join(',')+'}', function() {
      let config = get(this, get(this, 'driver'));
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
    if (get(this, 'inModal')) {
      return 'passConfigBack';
    } else {
      return 'save';
    }
  }),

  nameParts: computed('prefix','count', function() {
    let input = get(this, 'prefix')||'';
    let count = get(this, 'count');
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
  }),

  nameCountLabel: computed('nameParts','intl.locale', function() {
    let parts = get(this, 'nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      // qty=1 or no input yet, nothing to see here...
      return '';
    }

    let first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
    let last = parts.prefix + Util.strPad(parts.end, parts.minLength, '0');
    return get(this, 'intl').tHtml('driver.multiHostNames',{first: first, last: last});
  }),

  nameDidChange: on('init', observer('prefix', function() {
    set(this, 'primaryResource.name', get(this, 'prefix'));
  })),

  defaultDescription: computed('displayLocation','displaySize', function() {
    let loc = get(this, 'displayLocation');
    let size = get(this, 'displaySize');
    if ( loc && size ) {
      return loc + ' / ' + size;
    } else {
      return (loc||'') + (size||'');
    }
  }),

  willSave() {
    set(this, 'primaryResource.clusterId', get(this, 'cluster.id'));

    if ( get(this, 'primaryResource.type').toLowerCase() === 'machinetemplate') {
     if ( !get(this, 'primaryResource.description') ) {
       set(this, 'primaryResource.description', get(this, 'defaultDescription'));
     }
    }

    return this._super();
  },

  validate() {
    let errors = [];

    if ( !get(this, 'nameParts.prefix') && !get(this, 'nameParts.name') ) {
      errors.push('Name is required');
    }

    set(this, 'errors', errors);
    return errors.length === 0;
  },

  doSave() {
    const type = get(this, 'primaryResource.type').toLowerCase();
    const passBack = get(this, 'driverSaveAction') === 'passConfigBack' ? true : false;

    if ( type === 'machinetemplate' ) {
      return this._super(...arguments);
    } else if ( type === 'machine'  && !passBack ) {
      set(this, 'primaryResource.requestedHostname', get(this,'prefix'));
      set(this, 'primaryResource.clusterId', get(this, 'requestedClusterId'));
      return this._super(...arguments);
    } else {
      return resolve(get(this, 'primaryResource'));
    }
  },

  didSave() {
    let count = get(this, 'count');
    let parts = get(this, 'nameParts');
    let delay = get(this, 'createDelayMs');
    let passBack = get(this, 'driverSaveAction') === 'passConfigBack' ? true : false;
    let type = get(this, 'primaryResource.type').toLowerCase();
    let tpl;

    if ( type === 'machinetemplate') {
      if (passBack) {
        tpl = get(this, 'globalStore').createRecord({
          type: 'machineConfig',
          machineTemplateId: get(this, 'model.id'),
          requestedHostname: get(this, 'primaryResource.name'),
          displayName:  get(this, 'primaryResource.name'),
          state: 'to-create',
          role: [],
        });
      } else {
        tpl = get(this, 'globalStore').createRecord({
          type: 'machine',
          driver: get(this, 'model.driver'),
          machineTemplateId: get(this, 'model.id'),
          clusterId: get(this, 'cluster.id'),
        });
      }

      if (get(this, 'requestedClusterId')) {
        tpl.set('clusterId', get(this, 'requestedClusterId'));
      }

      if (get(this, 'role')) {
        tpl.set('role', get(this, 'role'));
      }

      return addHosts(passBack);
    } else if ( type === 'machine' && !passBack ) {
      // There is no passBack for actual machines
      return this._super(...arguments);
    } else if ( type === 'machineconfig' && passBack ) {
      const pr = get(this, 'primaryResource');
      set(pr, 'requestedHostname', get(this,'prefix'));
      return [pr];
    } else {
      if (passBack) {
        tpl = get(this, 'globalStore').createRecord({
          type: 'machineConfig',
          machineTemplateId: get(this, 'primaryResource.machineTemplateId'),
          requestedHostname: get(this, 'primaryResource.name'),
          displayName:  get(this, 'primaryResource.name'),
          state: 'to-create',
          role: [],
        });
      } else {
        // The model was the first one, add subsequent numbers
        tpl = get(this, 'primaryResource').clone();
        set(tpl, 'clusterId', get(tpl, 'requestedClusterId'));
        delete tpl.requestedClusterId;
      }
      return addHosts(passBack);
    }


    function addHosts(passConfigBack=false) {
      let hosts = [];
      for ( let i = parts.start ; i <= parts.end ; i++ )
      {
        let host = tpl.clone();
        let name = `${parts.prefix}${Util.strPad(i, parts.minLength, '0')}`;
        setProperties(host, {
          requestedHostname: name,
          displayName: name
        })
        hosts.push(host);
      }

      if ( parts.name ) {
        // Single host
        if ( count > 0 ) {
          tpl.set('requestedHostname', parts.name);
          if (passConfigBack) {
            return [tpl];
          } else {
            return tpl.save();
          }
        } else {
          return resolve(tpl);
        }
      } else {
        if (passConfigBack) {
          return hosts;
        } else {
          // Multiple hosts
          var promise = new EmberPromise(function(resolve,reject) {
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
    }
  },

  doneSaving() {
    this._super();
    this.send('goBack');
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
