Rancher UI
--------

Perhaps you like managing Cattle.

[![Build Status](https://drone.rancher.io/api/badges/rancher/ui/status.svg)](https://drone.rancher.io/rancher/ui)

## Usage

Prerequisites:
* [Bower](from http://bower.io/)
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) 0.12.x (with NPM)

If you're on a Mac and use Homebrew, you can follow these steps:
```bash
  brew install node watchman
  npm install -g bower
```

Setup:
```bash
  git clone 'https://github.com/rancher/ui'
  cd 'ui'
  ./scripts/update-dependencies
```

Run development server:
```bash
  npm start
```

Connect to UI at https://localhost:8000/ .  The server automatically picks up file changes, restarts itself, and reloads the web browser.  This is intended only for development, see below for distributing customizations.

Run development server pointed at another instance of the Rancher API
```bash
  RANCHER="http://rancher:8080/" npm start
```

and/or pointed at another instance of the Catalog API
```bash
  CATALOG="http://catalog:8088/" npm start
```

RANCHER and CATALOG can also be `hostname[:port]` or `ip[:port]`.

### Compiling for distribution

Rancher releases include a static copy of the UI passed in during build as a tarball.  To generate that, run:
```bash
  ./scripts/build-static
```

### Customizing

We highly suggest making customizations as an [ember-cli addon](http://ember-cli.com/extending/#developing-addons-and-blueprints) rather than forking this repo, making a bunch of changes and then fighting conflicts to keep it up to date with upstream forever.  [ui-example-addon-machine](https://github.com/rancher/ui-example-addon-machine) is an example addon that adds a custom screen for a docker-machine driver.  If there is no way for you to get to what you want to change from an addon, PRs to this repo that add generalized hooks so that you can are accepted.

### Translations
Rancher UI supports localization via translations files. You can swap translations live by utilizing the Language Picker located in the footer. If you would like to add your own translations files follow the directions below.

- Fork the Rancher UI repo
- Copy the ```en-us.yaml``` file located in ```/translations``` folder and rename using the ```<language-code>/<country-code>.yaml``` format ([Supported Locales](https://github.com/andyearnshaw/Intl.js/tree/master/locale-data/jsonp))
- Replace the values on each key with you're new values corresponding to your language
- Ensure you replace the ```languageName``` value as this is what will be displayed in the language picker in the UI
- While developing you can use ```SHFT + L``` when not focused in an input or text area to toggle the languages between your currently selected language and a special *none* language to see what key values are missing
- When you've finished you're translations issue a pull request back to the Rancher UI repo to have your translation included

### Hosting remotely

If you want to customize the UI, re-packaging all of Rancher to distribute the UI is possible but not terribly convenient. Instead you can change Cattle to load the UI source from a remote web server:

- Build with `./scripts/build-static -l -c 'your-server.com'`
- Upload `./dist/static/latest` so that it's available at http://your-server.com/latest (you can rename the "latest" part with the `-v` flag)
- If your Rancher is behind a SSL proxy, your-server must also respond to SSL requests
- Change the value of http[s]://your-rancher:8080/v1/settings/api.ui.index to `//yourserver.com/latest`

### Running Tests

```bash
  npm install -g ember-cli
```

* `ember test`
* `ember test --server`

### Bugs & Issues
Please submit bugs and issues to [rancher/rancher](//github.com/rancher/rancher/issues) with a title starting with `[UI] `.

Or just [click here](//github.com/rancher/rancher/issues/new?title=%5BUI%5D%20) to create a new issue.


#### Useful links

* ember: http://emberjs.com/
* ember-cli: http://www.ember-cli.com/
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

License
=======
Copyright (c) 2014-2016 [Rancher Labs, Inc.](http://rancher.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
