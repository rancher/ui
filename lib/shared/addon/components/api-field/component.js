import Component from '@ember/component';
import layout from './template';
import Resource from '@rancher/ember-api-store/models/resource';
import { get, observer } from '@ember/object'
import { run } from '@ember/runloop';

export default Component.extend({
  layout,
  resource:     null, // The object that is being edited
  resourceType: null, // The schema type the object is
  field:        null, // The field on resource that this input is for
  schema:       null, // All the schemas for all the types
  typeDocs:     null, // Type docs for all the types

  tagName:    'div',
  classNames: ['vertical-middle', 'span-6', 'api-field', 'box', 'mb-20'],

  value:        null,

  valueChanged: observer('value', function() {
    run.schedule('afterRender', () => {
      get(this, 'resource').set(get(this, 'field'), get(this, 'value'));
    });
  }),
  fieldDef: function() {
    var fieldName = get(this, 'field');
    var schema = get(this, 'schema');

    if ( !schema ) {
      return;
    }

    var orig = schema.resourceFields[fieldName];

    if ( !orig ) {
      return;
    }

    var out;

    if ( Resource.detectInstance(orig) ) {
      // the "type" field makes the store turn these into resources...
      out = orig.serialize();
    } else {
      out = JSON.parse(JSON.stringify(orig));
    }

    out.name = fieldName;


    return out;
  }.property('field', 'resourceType', 'schema'),

});
