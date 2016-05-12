import Ember from 'ember';

export default Ember.Component.extend({
  environmentId: null,
  loading: true,
  env: null,
  onlyType: null,

  tagName: '',

  didReceiveAttrs() {
    let id = this.get('environmentId');
    let onlyType = this.get('onlyType');

    this.setProperties({
      loading: true,
      env: null
    });

    if ( id )
    {
      this.get('userStore').find('project', id).then((env) => {
        if ( !onlyType || env.get('type').toLowerCase() === onlyType.toLowerCase() )
        {
          this.set('env', env);
        }
      }).catch(() => {
        this.set('env', null);
      }).finally(() => {
        this.set('loading', false);
      });
    }
    else
    {
      this.set('loading',false);
    }
  }
});
