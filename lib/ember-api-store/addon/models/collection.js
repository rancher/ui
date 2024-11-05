import { Promise } from 'rsvp';
import ArrayProxy from '@ember/array/proxy';
import { getOwner } from '@ember/application';
import TypeMixin from '../mixins/type';
import { copyHeaders } from '../utils/apply-headers';
import { normalizeType } from '../utils/normalize';

export default ArrayProxy.extend(TypeMixin, {
  type: 'collection',
  createDefaults: null,
  createTypes: null,
  filters: null,
  pagination: null,
  sort: null,
  sortLinks: null,

  reservedKeys: ['content'],

  toString: function() {
    return 'collection:'+ this.resourceType + '[' + this.length + ']';
  },

  request: function(opt) {
    const store = this.store;

    if ( !opt.headers ) {
      opt.headers = {};
    }

    var cls = getOwner(store).lookup('model:'+normalizeType(this.resourceType, store));

    if ( cls && cls.constructor.headers ) {
      copyHeaders(cls.constructor.headers, opt.headers);
    }

    return store.request(opt);
  },

  depaginate: function(depth) {
    var self = this;

    depth = depth || 1;
    /*
    if ( depth > 5 )
    {
      console.log('Depaginate, max depth reached');
      return new Ember.RSVP.Promise(function(resolve,reject) {
        resolve();
      });
    }
    */

    var promise = new Promise(function(resolve,reject) {
      var next = self.get('pagination.next');
      if ( next )
      {
        console.log('Depaginate, requesting', next);
        self.request({
          method: 'GET',
          url: next,
          depaginate: false,
          forPagination: true
        }).then(gotPage, fail);
      }
      else
      {
        resolve();
      }

      function gotPage(body)
      {
        //console.log('Depaginate, got page');
        self.set('pagination', body.get('pagination'));
        body.forEach(function(obj) {
          self.pushObject(obj);
        });

        if ( self.get('pagination.next') )
        {
          //console.log('Depaginate, more pages');
          // 98 bottles of beer on the wall...
          resolve( self.depaginate(depth+1));
        }
        else
        {
          //console.log('Depaginate, no more pages');
          resolve();
        }
      }

      function fail(body)
      {
        //console.log('Depaginate fail',body);
        reject(body);
      }
    },'Depaginate, depth '+depth);

    return promise;
  },
});
