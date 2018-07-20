import Component from '@ember/component';
import layout from './template';
import { get, setProperties, observer } from '@ember/object';

function maybeInt(str) {
  const num = parseInt(str, 10);

  if ( `${ num }` === str ) {
    return num;
  }

  return str;
}

export default Component.extend({
  layout,
  workload:  null,
  scaleMode: null,
  editing:   null,
  isUpgrade: null,

  classNames:     ['accordion-wrapper'],
  _strategy:      null,
  workloadConfig: null,
  batchSize:      null,

  didReceiveAttrs() {
    const config = get(this, 'workloadConfig');
    let  maxSurge = get(config, 'maxSurge');
    let  maxUnavailable = get(config, 'maxUnavailable');
    let  actualStrategy = get(config, 'strategy');

    const changes = {};

    if ( !actualStrategy ) {
      actualStrategy = 'RollingUpdate';
      maxSurge = 1;
      maxUnavailable = null;
    }

    if ( actualStrategy === 'RollingUpdate' ) {
      if ( maxSurge && maxUnavailable ) {
        changes['_strategy'] = 'custom';
      } else if ( maxSurge ) {
        changes['_strategy'] = 'startFirst';
        changes['batchSize'] = maxSurge;
      } else if ( maxUnavailable ) {
        changes['_strategy'] = 'stopFirst';
        changes['batchSize'] = maxUnavailable;
      } else {
        changes['_strategy'] = 'stopFirst';
      }
    }

    if ( actualStrategy === 'Recreate' ) {
      changes['_strategy'] = 'recreate';
    }

    setProperties(this, changes);
    this.strategyChanged();
  },

  strategyChanged: observer('_strategy', 'batchSize', function() {
    const _strategy = get(this, '_strategy');
    const config    = get(this, 'workloadConfig');

    let batchSize = maybeInt(get(this, 'batchSize'));
    let maxSurge = maybeInt(get(config, 'maxSurge'));
    let maxUnavailable = maybeInt(get(config, 'maxUnavailable'));

    if ( !maxSurge && !maxUnavailable ) {
      maxSurge = 1;
      maxUnavailable = 0;
    }

    if ( _strategy === 'startFirst' ) {
      setProperties(config, {
        strategy:       'RollingUpdate',
        maxSurge:       batchSize,
        maxUnavailable: 0,
      });
    } else if ( _strategy === 'stopFirst' ) {
      setProperties(config, {
        strategy:       'RollingUpdate',
        maxSurge:       0,
        maxUnavailable: batchSize,
      });
    } else if ( _strategy === 'custom' ) {
      setProperties(config, {
        strategy:       'RollingUpdate',
        maxSurge,
        maxUnavailable
      });
    } else if ( _strategy === 'recreate' ) {
      setProperties(config, {
        strategy:       'Recreate',
        maxSurge:       null,
        maxUnavailable: null,
      });
    }
  }),
});
