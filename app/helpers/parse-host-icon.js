import Ember from 'ember';
const PROVIDERS = [
  {
    id: 'amazon',
    class: 'amazonec2'
  },
  {
    id: 'digitalocean',
    class: 'rancherdo'
  },
  {
    id: 'packet',
    class: 'packet '
  },
]
export function parseHostIcon(params/*, hash*/) {
  return PROVIDERS.findBy('id', params[0]).class || 'other';
}

export default Ember.Helper.helper(parseHostIcon);
