"use strict";

define("nodes/components/driver-pnap/component", ["exports", "shared/mixins/node-driver"], function (exports, _nodeDriver) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var LAYOUT = "PHNlY3Rpb24gY2xhc3M9Imhvcml6b250YWwtZm9ybSI+CiAge3sjYWNjb3JkaW9uLWxpc3Qgc2hvd0V4cGFuZEFsbD1mYWxzZSBhcyB8IGFsIGV4cGFuZEZuIHx9fQogIDxkaXYgY2xhc3M9ImJveCBtdC0yMCI+CiAgICA8aDQ+CiAgICAgIEFjY291bnQgU2VjdGlvbgogICAgPC9oND4KICAgIDxkaXYgY2xhc3M9InJvdyBpbmxpbmUtZm9ybSI+CiAgICAgIDxkaXYgY2xhc3M9ImNvbCBzcGFuLTYiPgogICAgICAgIDxsYWJlbCBjbGFzcz0iYWNjLWxhYmVsIj4KICAgICAgICAgQ2xpZW50IElEIHt7ZmllbGQtcmVxdWlyZWR9fQogICAgICAgIDwvbGFiZWw+CiAgICAgICAge3sjaW5wdXQtb3ItZGlzcGxheSBlZGl0YWJsZT0obm90IGRhdGFGZXRjaGVkKSB2YWx1ZT1jb25maWcuY2xpZW50SWRlbnRpZmllcn19CiAgICAgICAge3tpbnB1dAogICAgICAgICAgICAgICAgdHlwZT0idGV4dCIKICAgICAgICAgICAgICAgIG5hbWU9InVzZXJuYW1lIgogICAgICAgICAgICAgICAgdmFsdWU9Y29uZmlnLmNsaWVudElkZW50aWZpZXIKICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM9ImZvcm0tY29udHJvbCIKICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPSh0ICJQbGVhc2UgZW50ZXIgeW91ciBDbGllbnQgSUQuIikKICAgICAgICAgICAgICB9fQogICAgICAgIHt7L2lucHV0LW9yLWRpc3BsYXl9fQogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY29sIHNwYW4tNiI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJhY2MtbGFiZWwiPgogICAgICAgICBDbGllbnQgU2VjcmV0IHt7ZmllbGQtcmVxdWlyZWR9fQogICAgICAgIDwvbGFiZWw+CiAgICAgICAge3sjaW5wdXQtb3ItZGlzcGxheSBlZGl0YWJsZT0obm90IGRhdGFGZXRjaGVkKSB2YWx1ZT1jb25maWcuY2xpZW50U2VjcmV0IG9iZnVzY2F0ZT10cnVlfX0KICAgICAgICB7e2lucHV0CiAgICAgICAgICAgICAgICB0eXBlPSJwYXNzd29yZCIKICAgICAgICAgICAgICAgIG5hbWU9InBhc3N3b3JkIgogICAgICAgICAgICAgICAgdmFsdWU9Y29uZmlnLmNsaWVudFNlY3JldAogICAgICAgICAgICAgICAgY2xhc3NOYW1lcz0iZm9ybS1jb250cm9sIgogICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9KHQgIlBsZWFzZSBlbnRlciB5b3VyIENsaWVudCBzZWNyZXQuIikKICAgICAgICAgICAgICB9fQogICAgICAgIHt7L2lucHV0LW9yLWRpc3BsYXl9fQogICAgICAgIDxwIGNsYXNzPSJ0ZXh0LWluZm8iIGh0bWxTYWZlPXRydWU+CiAgICAgICAgICBGcm9tIDxhIGhyZWY9Imh0dHBzOi8vYm1jLnBob2VuaXhuYXAuY29tL2FwcGxpY2F0aW9ucy8iPlBOQVAgQk1DIFBvcnRhbDwvYT4gQXBwbGljYXRpb24gQ3JlZGVudGlhbHMKICAgICAgICA8L3A+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0ib3Zlci1ociBtYi0yMCI+CiAgICA8c3Bhbj4KICAgICAge3tkcml2ZXJPcHRpb25zVGl0bGV9fQogICAgPC9zcGFuPgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImJveCBtdC0yMCI+CiAgICA8aDQ+U2VydmVyIERldGFpbHMgU2VjdGlvbjwvaDQ+CiAgICA8ZGl2IGNsYXNzPSJyb3cgaW5saW5lLWZvcm0iPgogICAgICB7eyEtLSA8ZGl2IGNsYXNzPSJjb2wgc3Bhbi02Ij4KICAgICAgICA8bGFiZWwgY2xhc3M9ImFjYy1sYWJlbCI+CiAgICAgICAgIEhvc3RuYW1lCiAgICAgICAgPC9sYWJlbD4KICAgICAgICB7eyBpbnB1dCBjbGFzc05hbWVzPSJmb3JtLWNvbnRyb2wiIHZhbHVlPWNvbmZpZy5zZXJ2ZXJIb3N0bmFtZSB9fQogICAgICA8L2Rpdj4gLS19fQoKICAgICAgPGRpdiBjbGFzcz0iY29sIHNwYW4tNiI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJhY2MtbGFiZWwiPgogICAgICAgICBMb2NhdGlvbgogICAgICAgIDwvbGFiZWw+CiAgICAgICAgPHNlbGVjdCBjbGFzcz0iZm9ybS1jb250cm9sIiBvbmNoYW5nZT17e2FjdGlvbiAobXV0IGNvbmZpZy5zZXJ2ZXJMb2NhdGlvbikgdmFsdWU9InRhcmdldC52YWx1ZSJ9fT4KICAgICAgICAgIHt7I2VhY2ggbG9jYXRpb25zIGFzIHxjaG9pY2V8fX0KICAgICAgICAgIDxvcHRpb24gdmFsdWU9e3tjaG9pY2UudmFsdWV9fSBzZWxlY3RlZD17e2VxIGNvbmZpZy5zZXJ2ZXJMb2NhdGlvbiBjaG9pY2UudmFsdWV9fT4KICAgICAgICAgICAge3tjaG9pY2UubmFtZX19CiAgICAgICAgICA8L29wdGlvbj4KICAgICAgICAgIHt7L2VhY2h9fQogICAgICAgIDwvc2VsZWN0PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY29sIHNwYW4tNiI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJhY2MtbGFiZWwiPgogICAgICAgICBPUwogICAgICAgIDwvbGFiZWw+CiAgICAgICAgPHNlbGVjdCBjbGFzcz0iZm9ybS1jb250cm9sIiBvbmNoYW5nZT17e2FjdGlvbiAobXV0IGNvbmZpZy5zZXJ2ZXJPcykgdmFsdWU9InRhcmdldC52YWx1ZSJ9fT4KICAgICAgICAgIHt7I2VhY2ggb3NDaG9pY2VzIGFzIHxjaG9pY2V8fX0KICAgICAgICAgIDxvcHRpb24gdmFsdWU9e3tjaG9pY2UudmFsdWV9fSBzZWxlY3RlZD17e2VxIGNvbmZpZy5zZXJ2ZXJPcyBjaG9pY2UudmFsdWV9fT4KICAgICAgICAgICAge3tjaG9pY2UubmFtZX19CiAgICAgICAgICA8L29wdGlvbj4KICAgICAgICAgIHt7L2VhY2h9fQogICAgICAgIDwvc2VsZWN0PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY29sIHNwYW4tNiI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJhY2MtbGFiZWwiPgogICAgICAgICAgVHlwZQogICAgICAgIDwvbGFiZWw+CiAgICAgICAgIDxzZWxlY3QgY2xhc3M9ImZvcm0tY29udHJvbCIgb25jaGFuZ2U9e3thY3Rpb24gKG11dCBjb25maWcuc2VydmVyVHlwZSkgdmFsdWU9InRhcmdldC52YWx1ZSJ9fT4KICAgICAgICAgIHt7I2VhY2ggdHlwZXMgYXMgfGNob2ljZXx9fQogICAgICAgICAgPG9wdGlvbiB2YWx1ZT17e2Nob2ljZS52YWx1ZX19IHNlbGVjdGVkPXt7ZXEgY29uZmlnLnNlcnZlclR5cGUgY2hvaWNlLnZhbHVlfX0+CiAgICAgICAgICAgIHt7Y2hvaWNlLm5hbWV9fQogICAgICAgICAgPC9vcHRpb24+CiAgICAgICAgICB7ey9lYWNofX0KICAgICAgICA8L3NlbGVjdD4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2Rpdj4KCiAgPGRpdiBjbGFzcz0ib3Zlci1ociI+CiAgICA8c3Bhbj4KICAgICAge3t0ZW1wbGF0ZU9wdGlvbnNUaXRsZX19CiAgICA8L3NwYW4+CiAgPC9kaXY+CgogIHt7Zm9ybS1uYW1lLWRlc2NyaXB0aW9uCiAgICAgICAgbW9kZWw9bW9kZWwKICAgICAgICBuYW1lUmVxdWlyZWQ9dHJ1ZQogICAgICAgIHJvd0NsYXNzPSJyb3cgbWItMTAiCiAgICAgIH19CgogIHt7Zm9ybS11c2VyLWxhYmVscwogICAgICAgIGluaXRpYWxMYWJlbHM9bGFiZWxSZXNvdXJjZS5sYWJlbHMKICAgICAgICBzZXRMYWJlbHM9KGFjdGlvbiAic2V0TGFiZWxzIikKICAgICAgICBleHBhbmQ9KGFjdGlvbiBleHBhbmRGbikKICAgICAgfX0KCiAge3tmb3JtLW5vZGUtdGFpbnRzCiAgICAgICAgbW9kZWw9bW9kZWwKICAgICAgICBleHBhbmQ9KGFjdGlvbiBleHBhbmRGbikKICAgICAgfX0KCiAge3tmb3JtLWVuZ2luZS1vcHRzCiAgICAgICAgbWFjaGluZT1tb2RlbAogICAgICAgIHNob3dFbmdpbmVVcmw9c2hvd0VuZ2luZVVybAogICAgICB9fQoKICB7e3RvcC1lcnJvcnMgZXJyb3JzPWVycm9yc319CiAge3tzYXZlLWNhbmNlbAogICAgICAgIHNhdmU9KGFjdGlvbiAic2F2ZSIpCiAgICAgICAgY2FuY2VsPShhY3Rpb24gImNhbmNlbCIpCiAgICAgICAgZWRpdGluZz1lZGl0aW5nCiAgICAgIH19CiAge3svYWNjb3JkaW9uLWxpc3R9fQo8L3NlY3Rpb24+Cg==";
  var computed = Ember.computed;
  var get = Ember.get;
  var set = Ember.set;
  var alias = Ember.computed.alias;
  var service = Ember.inject.service;
  var defaultRadix = 10;
  var defaultBase = 1024;
  exports.default = Ember.Component.extend(_nodeDriver.default, {
    driverName: 'pnap',
    step: 1,
    config: alias('model.pnapConfig'),
    app: service(),
    init: function init() {
      var decodedLayout = window.atob(LAYOUT);
      var template = Ember.HTMLBars.compile(decodedLayout, {
        moduleName: 'nodes/components/driver-pnap/template'
      });
      set(this, 'layout', template);

      this._super.apply(this, arguments);
    },
    actions: {
      authenticate: function authenticate(savedCB) {
        if (!this.validateAuthentication()) {
          savedCB(false);
          return;
        }

        savedCB(true);
      }
    },
    bootstrap: function bootstrap() {
      var config = get(this, 'globalStore').createRecord({
        type: 'pnapConfig',
        clientIdentifier: '',
        clientSecret: '',
        serverLocation: 'PHX',
        serverType: 's1.c1.medium',
        serverOs: 'ubuntu/bionic',
        serverHostname: 'host'
      });
      set(this, 'model.pnapConfig', config);
      this.setProperties({
        locations: [{
          name: "PHX",
          value: "PHX"
        }, {
          name: "ASH",
          value: "ASH"
        }],
        types: [{
          name: "s1.c1.small",
          value: "s1.c1.small"
        }, {
          name: "s1.c1.medium",
          value: "s1.c1.medium"
        }, {
          name: "s1.c2.medium",
          value: "s1.c2.medium"
        }, {
          name: "s1.c2.large",
          value: "s1.c2.large"
        }, {
          name: "d1.c1.small",
          value: "d1.c1.small"
        }, {
          name: "d1.c1.medium",
          value: "d1.c1.medium"
        }, {
          name: "d1.c1.large",
          value: "d1.c1.large"
        }, {
          name: "d1.m1.medium",
          value: "d1.m1.medium"
        }],
        osChoices: [{
          name: "ubuntu/bionic",
          value: "ubuntu/bionic"
        }, {
          name: "centos/centos7",
          value: "centos/centos7"
        }]
      });
    },
    validate: function validate() {
      this._super();

      var errors = get(this, 'errors') || [];

      if (!get(this, 'config.serverLocation') || get(this, 'config.serverLocation') == "") {
        errors.push('Location is requried');
      }

      if (!get(this, 'config.serverType') || get(this, 'config.serverType') == "") {
        errors.push('Type is requried');
      }

      if (!get(this, 'config.serverOs') || get(this, 'config.serverOs') == "") {
        errors.push('OS is requried');
      }

      if (!get(this, 'config.serverHostname') || get(this, 'config.serverHostname') == "") {
        errors.push('Hostname is requried');
      }

      if (!get(this, 'config.clientIdentifier') || get(this, 'config.clientIdentifier') == "") {
        errors.push('Client ID is required');
      }

      if (!get(this, 'config.clientSecret') || get(this, 'config.clientSecret') == "") {
        errors.push('Client secret is requried');
      }

      if (get(errors, 'length')) {
        set(this, 'errors', errors);
        return false;
      } else {
        set(this, 'errors', null);
        return true;
      }
    },
    validateAuthentication: function validateAuthentication() {
      var errors = get(this, 'model').validationErrors();

      if (!get(this, 'config.clientID') || get(this, 'config.clientID') == "") {
        errors.push('Client ID is required');
      }

      if (!get(this, 'config.clientSecret') || get(this, 'config.clientSecret') == "") {
        errors.push('Client secret is requried');
      }

      if (errors.length) {
        set(this, 'errors', errors.uniq());
        return false;
      }

      return true;
    }
  });
});;
"use strict";

define("ui/components/driver-pnap/component", ["exports", "nodes/components/driver-pnap/component"], function (exports, _component) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _component.default;
    }
  });
});