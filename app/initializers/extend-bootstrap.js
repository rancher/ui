import BootstrapFixes from 'ui/utils/bootstrap-fixes';

export function initialize( /*application*/ ) {
  $(document).on('shown.bs.dropdown.position-calculator', function(event, data) {
    BootstrapFixes.resizeDropdown(event, data);
  });
}

export default {
  name: 'extend-bootstrap',
  initialize: initialize
};
