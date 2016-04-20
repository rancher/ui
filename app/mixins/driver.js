import Ember from 'ember';
import Util from 'ui/utils/util';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ManageLabels from 'ui/mixins/manage-labels';
import C from 'ui/utils/constants';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Mixin.create(NewOrEdit, ManageLabels, {
  settings: Ember.inject.service(),
  docsBase:  C.EXT_REFERENCES.DOCS,
  createDelayMs: 0,

  queryParams: ['machineId'],
  machineId: null,
  error: null,

  count: null,
  prefix: null,
  multiTemplate: null,

  actions: {
    addLabel: addAction('addLabel', '.key'),
    cancel() {
      this.attrs.cancel();
    },
    goBack() {
      this.attrs.goBack();
    },
    setLabels(labels) {
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('primaryResource.labels', out);
    }
  },

  nameParts: function() {
    var input = this.get('prefix')||'';
    var count = this.get('count');
    var match = input.match(/^(.*?)([0-9]+)$/);

    if ( count <= 1 )
    {
      return {
        name: input,
      };
    }

    var prefix, minLength, start;
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
    var end = start + count - 1;
    minLength = Math.max(minLength, (end+'').length);

    return {
      prefix: prefix,
      minLength: minLength,
      start: start,
      end: end
    };
  }.property('prefix','count'),

  nameCountLabel: function() {
    var parts = this.get('nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      // qty=1 or no input yet, nothing to see here...
      return '';
    }

    var first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
    var last = parts.prefix + Util.strPad(parts.end, parts.minLength, '0');
    return new Ember.Handlebars.SafeString('Hosts will be named <b>' + first + '</b> &mdash; <b>' + last + '</b>');
  }.property('nameParts'),

  nameDidChange: function() {
    var parts = this.get('nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      this.set('primaryResource.name', parts.name || '');
    }
    else
    {
      var first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
      this.set('primaryResource.name', first);
    }
  }.observes('nameParts'),

  initFields: function() {
    this._super();
    this.set('prefix', this.get('primaryResource.name')||'');
  },

  willSave: function() {
    this.set('multiTemplate', this.get('primaryResource').clone());
    return this._super();
  },

  didSave: function() {
    if ( this.get('count') > 1 )
    {
      let parts = this.get('nameParts');
      let tpl = this.get('multiTemplate');
      let delay = this.get('createDelayMs');
      var promise = new Ember.RSVP.Promise(function(resolve,reject) {
        let machines = [];
        for ( let i = parts.start + 1 ; i <= parts.end ; i++ )
        {
          let machine = tpl.clone();
          machine.set('name', parts.prefix + Util.strPad(i, parts.minLength, '0'));
          machines.push(machine);
        }

        async.eachSeries(machines, function(machine, cb) {
          machine.save().then(() => {
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
  },

  doneSaving: function() {
    var out = this._super();
    this.send('goBack');
    return out;
  },
  didInsertElement: function() {
    this._super();
    Ember.run.next(() => {
      try {
        var input = this.$('INPUT')[0];
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
