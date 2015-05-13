import Ember from "ember";
import Resource from 'ember-api-store/models/resource';
import { normalizeType } from 'ember-api-store/utils/normalize';

export function initialize(/* container, application */) {
  Resource.reopen({
    trimValues: function() {
      this.eachKeys((val,key) => {
        Ember.set(this, key, recurse(val));
      });

      return this;

      function recurse(val) {
        if ( typeof val === 'string' )
        {
          return val.trim();
        }
        else if ( Ember.isArray(val) )
        {
          val.beginPropertyChanges();
          val.forEach((v, idx) => {
            var out = recurse(v);
            if ( val.objectAt(idx) !== out )
            {
              val.replace(idx, 1, out);
            }
          });
          val.endPropertyChanges();
          return val;
        }
        else if ( Resource.detectInstance(val) )
        {
          return val.trimValues();
        }
        else if ( val && typeof val === 'object' )
        {
          Object.keys(val).forEach(function(key) {
            Ember.set(val, key, recurse(val[key]));
          });
          return val;
        }
        else
        {
          return val;
        }
      }
    },

    validationErrors: function() {
      var errors = [];
      var type = normalizeType(this.get('type'));
      var schema = this.get('store').getById('schema', type);
      if ( !schema )
      {
        console.warn('No schema found to validate', type, this);
        return null;
      }

      // Trim all the values to start so that empty strings become nulls
      this.trimValues();

      var fields = schema.resourceFields;
      var keys = Object.keys(fields);
      var field, key, val;
      var more;
      for ( var i = 0 ; i < keys.length ; i++ )
      {
        key = keys[i];
        field = fields[key];
        val = this.get(key);

        if ( val === undefined )
        {
          val = null;
        }

        if ( field.type.indexOf('[') >= 0 )
        {
          // array, map, reference
          // @todo
        }
        else if ( ['string','password','float','int','date','blob','boolean','enum'].indexOf(field.type) === -1 )
        {
          // embedded schema type
          if ( val && val.validationErrors )
          {
            more = val.validationErrors();
            errors.pushObjects(more);
          }
        }

        // Coerce strings to numbers
        if ( field.type === 'float' && typeof val === 'string' )
        {
          val = parseFloat(val) || null; // NaN becomes null
          this.set(key, val);
        }

        if ( field.type === 'int' && typeof val === 'string' && key !== 'id' ) // Sigh: ids are all marked int, rancherio/rancher#515
        {
          val = parseInt(val, 10) || null;
          this.set(key, val);
        }

        // Empty strings on nullable fields -> null
        if ( ['string','password','float','int','date','blob','enum'].indexOf(field.type) >= 0 )
        {
          if ( (typeof val === 'string' && !val) || val === null ) // empty/null strings or null numbers
          {
            if ( field.nullable )
            {
              val = null;
              this.set(key, val);
            }
          }
        }

        var len = (val ? Ember.get(val,'length') : 0);
        if ( field.required && (val === null || (typeof val === 'string' && len === 0) || (Ember.isArray(val) && len === 0) ) )
        {
          errors.push('"' + key + '" is required');
          continue;
        }

        var min, max;
        var desc = (field.type.indexOf('array[') === 0 ? 'item' : 'character');
        if ( val !== null )
        {
          // String and array length:
          min = field.minLength;
          max = field.maxLength;
          if ( min && max )
          {
            if ( (len < min) || (len > max) )
            {
              errors.push(key + ' should be ' + min + '-' + max + ' ' + desc + (min === 1 && max === 1 ? '' : 's') + ' long');
            }
          }
          else if ( min && (len < min) )
          {
            errors.push(key + ' should be at least ' + min + ' ' + desc + (min === 1 ? '' : 's') + ' long');
          }
          else if ( max && (len > max) )
          {
            errors.push(key + ' should be at most ' + max + ' ' + desc + (min === 1 ? '' : 's') + ' long');
          }

          // Number min/max
          min = field.min;
          max = field.max;
          if ( val !== null && min && max )
          {
            if ( (val < min) || (val > max) )
            {
              errors.push(key + ' should be between ' + min + ' and ' + max);
            }
          }
          else if ( min && (val < min) )
          {
            errors.push(key + ' should be at least ' + min + ' ' + desc);
          }
          else if ( max && (val > max) )
          {
            errors.push(key + ' should be at most ' + max + ' ' + desc);
          }

          var test = [];
          if ( field.validChars )
          {
            test.push('[^'+ field.validChars + ']');
          }

          if ( field.invalidChars )
          {
            test.push('['+ field.invalidChars + ']');
          }

          if ( test.length )
          {
            var regex = new RegExp('('+ test.join('|') + ')');
            if ( regex.test(val) )
            {
              errors.push('key' + ' contains invalid characters');
            }
          }
        }
      }

      return errors;
    },

    serializeForNew: function() {
      var copy = this.serialize();
      delete copy.id;
      delete copy.actions;
      delete copy.links;
      delete copy.uuid;
      return copy;
    }
  });
}

export default {
  name: 'extend-resource',
  initialize: initialize
};

