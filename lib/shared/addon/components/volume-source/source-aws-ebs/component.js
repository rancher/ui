import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';
import { get, set } from '@ember/object';

const FIELD = 'awsElasticBlockStore';
const TYPE = 'awsElasticBlockStoreVolumeSource';

export default Component.extend(VolumeSource, {
  layout,

  volume: null,

  didReceiveAttrs() {
    if ( !get(this, `volume.${FIELD}`) ) {
      set(this, `volume.${FIELD}`, get(this, 'store').createRecord({
        type: TYPE,
      }));
    }

    // @TODO-2.0 hack, the field is called type...
    set(this, `volume.${FIELD}.type`, '');
  },
});
