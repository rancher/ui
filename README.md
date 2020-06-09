Rancher UI
--------

Perhaps you like managing Cattle.

## Usage

Prerequisites:
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) 8.x+ (with NPM)
* [Yarn](https://yarnpkg.com/en/docs/install) (Note Path Setup)

If you're on a Mac and use Homebrew, you can follow these steps:
```bash
  brew install node watchman yarn
```

Setup:
```bash
  git clone 'https://github.com/rancher/ui'
  cd 'ui'
  ./scripts/update-dependencies
```

Run development server:
```bash
  yarn start
```

Connect to UI at https://localhost:8000/ .  The server automatically picks up file changes, restarts itself, and reloads the web browser.  This is intended only for development, see below for distributing customizations.

Run development server pointed at another instance of the Rancher API
```bash
  RANCHER="https://rancher-server" yarn start
```

RANCHER can also be `hostname[:port]` or `ip[:port]`.

### Compiling for distribution

Rancher releases include a static copy of the UI passed in during build as a tarball.  To generate that, run:
```bash
  ./scripts/build-static
```
### Customizing

We highly suggest making customizations as an [ember-cli addon](http://ember-cli.com/extending/#developing-addons-and-blueprints) rather than forking this repo, making a bunch of changes and then fighting conflicts to keep it up to date with upstream forever.  [ui-example-addon-machine](https://github.com/rancher/ui-example-addon-machine) is an example addon that adds a custom screen for a docker-machine driver.  If there is no way for you to get to what you want to change from an addon, PRs to this repo that add generalized hooks so that you can are accepted.

### Project Structure

Rancher UI uses [Ember CLI Pods](https://cli.emberjs.com/release/advanced-use/project-layouts/#podslayout) for its project structure. We suggest reading the documentation if you have questions about the layout of the Rancher UI project.

### Engines and In-repo Addons

Rancher UI uses [Ember Engines](http://ember-engines.com) to break the deliverable code into smaller chunks and only deliver what the end-user will need. When adding new components to an engine ensure you are only re-exporting the component back out of the engine if it is required and can not be placed in the `shared` in-repo addon. When adding a new service or dependency that is required by an engine ensure that you pass the dependencies to the engine, more info can be found [here](http://ember-engines.com/guide/services)

The `shared` in-repo addon is a central repository of shared components for use with both the main app and any in-repo engine.

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
- Upload `./dist/static/latest2` so that it's available at https://your-server.com/latest2
  - It must be available over HTTPS.
  - You can rename the "latest2" part with the `-v` flag
- Change the value of https://your-rancher/v3/settings/ui-index to the same `https://your-server.com/latest2` URL

### Running Tests

```bash
  yarn global add ember-cli
```

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js -- --fix`

* `ember test`
* `ember test --server`

### Bugs & Issues
Please submit bugs and issues to [rancher/rancher](//github.com/rancher/rancher/issues) with a title starting with `[UI] `.

Or just [click here](//github.com/rancher/rancher/issues/new?title=%5BUI%5D%20) to create a new issue.


#### Useful links

* ember: http://emberjs.com/
* ember-cli: http://www.ember-cli.com/
* ember-engines: http://ember-engines.com/
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

License
=======
Copyright (c) 2014-2019 [Rancher Labs, Inc.](http://rancher.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
