import { isArray } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, computed, observer } from '@ember/object';

export default Component.extend({
  allWorkloads: service(),

  layout,
  selected:          null,  // Selected workload ID
  selectClass:       'form-control',
  withPods:          false,
  readOnly:          false,
  editing:           true,
  exclude:           null,  // ID or array of IDs to exclude from list
  selectedNamespace: null,
  // For use as a catalog question
  field:             null,              // Read default from a schema resourceField
  value:             null,              // namespace/workloadName string output

  // For other abuses
  obj: null,

  init() {
    this._super(...arguments);

    if ( this.get('obj') ) {
      this.set('selected', this.get('obj.id'));
    }

    let def = this.get('field.default');

    if ( def && !this.get('selected') ) {
      var exact, justWorkload;

      this.get('allWorkloads.list').forEach((entry) => {
        if ( def === entry.value ) {
          exact = entry.id;
        } else if ( def === entry.name ) {
          justWorkload = entry.id;
        }
      });

      this.set('selected', exact || justWorkload || null);
    }
  },

  selectedChanged: observer('selected', function() {
    let id = this.get('selected');
    let str = null;
    let workload = null;

    if ( id ) {
      workload = this.get('allWorkloads').byId(id);
      if ( workload ) {
        str = `${ workload.get('namespace.name')  }/${  workload.get('name') }`;
      }
    }

    this.set('value', str);
    this.set('obj', workload);
  }),

  grouped: computed('allWorkloads.list.[]', 'selectedNamespace', function() {
    let list = this.get('allWorkloads.list');

    let exclude = this.get('exclude');

    if ( exclude ) {
      if ( !isArray(exclude) ) {
        exclude = [exclude];
      }

      list = list.filter((x) => !exclude.includes(x.id));
    }

    if (this.get('selectedNamespace')) {
      list = list.filter((x) => x.stackName === this.get('selectedNamespace.id'));
    }

    let out = this.get('allWorkloads').group(list);
    let selected = this.get('allWorkloads').byId(this.get('selected'));

    if ( selected && !list.findBy('id', selected.get('id')) ) {
      out['(Selected)'] = [{
        id:   selected.get('id'),
        name: selected.get('displayName'),
        kind: selected.get('type'),
        obj:  selected,
      }];
    }

    return out;
  }),

  readableWorkload: computed('selected', function() {
    const { selected, selectedNamespace } = this;
    const workload                        = get(selectedNamespace, 'workloads').findBy('id', selected);

    let out = 'N/A';

    if (workload) {
      out = get(workload, 'displayName');
    }

    return out;
  }),
});
