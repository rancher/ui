import Ember from 'ember';
import Util from 'ui/utils/util';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ManageLabels from 'ui/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Mixin.create(NewOrEdit, ManageLabels, {
  intl          : Ember.inject.service(),
  settings      : Ember.inject.service(),
  createDelayMs : 0,
  showEngineUrl : true,

  queryParams   : ['hostId'],
  hostId        : null,
  error         : null,

  count         : null,
  prefix        : null,
  clonedModel   : null,
  useHost       : true,
  hostConfig    : null,
  labelResource: Ember.computed.alias('model.publicValues'),

  actions: {
    addLabel: addAction('addLabel', '.key'),
    cancel() {
      if (Ember.typeOf(this.attrs.goBack) === 'function') {
        this.attrs.goBack();
      }
    },
    goBack() {
      if (Ember.typeOf(this.attrs.goBack) === 'function') {
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
    this.set('displayLocation', Ember.computed(
      this.driver+'.{'+locationA.join(',')+'}',
      this.driver+'.{'+locationB.join(',')+'}',
    function() {
      let out = '';
      let config = this.get(this.get('driver'));
      for ( let i = 0 ; i < locationA.length ; i++ ) {
        let key = locationA[i];
        let val = config.get(key);
        if ( val ) {
          out = val;
          break;
        }
      }

      for ( let i = 0 ; i < locationB.length ; i++ ) {
        let key = locationB[i];
        let val = config.get(key);
        if ( val ) {
          out += val;
          break;
        }
      }

      return out;
    }));

    this.set('displaySize', Ember.computed(this.driver+'.{'+size.join(',')+'}', function() {
      let config = this.get(this.get('driver'));
      for ( let i = 0 ; i < size.length ; i++ ) {
        let key = size[i];
        let val = config.get(key);
        if ( val ) {
          return val;
        }
      }

      return '';
    }));
  },

  driverSaveAction: Ember.computed('inModal', function() {
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
    if ( this.get('primaryResource.type').toLowerCase() === 'hosttemplate') {
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
    if ( this.get('primaryResource.type').toLowerCase() === 'hosttemplate' ) {
      return this._super(...arguments);
    } else {
      return Ember.RSVP.resolve(this.get('primaryResource'));
    }
  },

  didSave() {
    let count = this.get('count');
    let parts = this.get('nameParts');
    let delay = this.get('createDelayMs');
    let tpl;
    if ( this.get('primaryResource.type').toLowerCase() === 'hosttemplate') {
      tpl = this.get('store').createRecord({
        type: 'host',
        driver: this.get('model.driver'),
        hostTemplateId: this.get('model.id'),
      });

      // The hostTemplate was the first one, wait for it then add hosts
      return this.get('model').waitForState('active').then(() => {
        return addHosts();
      });
    } else {
      // The model was the first one, add subsequent numbers
      tpl = this.get('multiTemplate');
      return addHosts();
    }

    function addHosts() {
      if ( parts.name ) {
        // Single host
        if ( count > 0 ) {
          tpl.set('hostname', parts.name);
          return tpl.save();
        } else {
          return Ember.RSVP.resolve();
        }
      } else {
        // Multiple hosts
        var promise = new Ember.RSVP.Promise(function(resolve,reject) {
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
              resolve();
            }
          });
        });

        return promise;
      }
    }
  },

  doneSaving() {
    let out = this._super();
    this.get('router').transitionTo('hosts');
    return out;
  },

  didInsertElement() {
    this._super();
    Ember.run.next(() => {
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
