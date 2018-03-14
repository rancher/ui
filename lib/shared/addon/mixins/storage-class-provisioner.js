import Mixin from '@ember/object/mixin';

export default Mixin.create({
  parameters: null,
  editing: null,

  actions: {
    changed(map) {
      this.sendAction('changed', map);
    },
  },
});
