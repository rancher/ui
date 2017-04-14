import Ember from 'ember';
const PROVIDERS = [
  {
    id: 'Amazon',
    class: 'amazonec2'
  },
  {
    id: 'Digital Ocean',
    class: 'rancherdo'
  },
  {
    id: 'Packet',
    class: 'packet '
  },
]
export function parseHostIcon(params/*, hash*/) {
  return PROVIDERS.findBy('id', params[0]).class || 'other';
}

export default Ember.Helper.helper(parseHostIcon);
