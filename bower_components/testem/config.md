# Bower configuration

The config is obtained by merging multiple configurations by this order of importance:

1. CLI arguments via `--config`
2. Environment variables
3. Environment variables with [`config`](https://docs.npmjs.com/files/package.json#config) key of package.json
4. Local .bowerrc located in the current working directory
5. All .bowerrc files upwards the directory tree
6. `.bowerrc` file located in user’s home folder (~)
7. `.bowerrc` file located in the global folder (/)

Example of CLI arguments:

- `--config.endpoint-parser=<parser>`
- `--config.storage.packages=<packages>`

Example of valid environment variables:

- `bower_https_proxy` is evaluated as `https-proxy`
- `bower_storage__packages` is evaluated as `storage.packages`

The same keys can be used under `config` key in package.json

Available configuration variables, in `.bowerrc.` format:

<pre><code>{
  <a href="#cwd">"cwd"</a>: "~/my-project",
  <a href="#directory">"directory"</a>: "bower_components",
  <a href="#registry">"registry"</a>: "https://bower.herokuapp.com",
  <a href="#shorthand-resolver">"shorthand-resolver"</a>: "git://github.com/{{owner}}/{{package}}.git",
  <a href="#proxy">"proxy"</a>: "http://proxy.local",
  <a href="#https-proxy">"https-proxy"</a>: "https://proxy.local",
  <a href="#ca">"ca"</a>: "/var/certificate.pem",
  <a href="#color">"color"</a>: true,
  <a href="#timeout">"timeout"</a>: 60000,
  <a href="#strict-ssl">"strict-ssl"</a>: true,
  <a href="#storage">"storage"</a>: {
    "packages" : "~/.bower/packages",
    "registry" : "~/.bower/registry",
    "links" : "~/.bower/links"
  },
  <a href="#interactive">"interactive"</a>: true,
  <a href="#resolvers">"resolvers"</a>: [
    "mercurial-bower-resolver"
  ],
  <a href="#shallowclonehosts">"shallowCloneHosts"</a>: [
    "myGitHost.example.com"
  ],
  <a href="#scripts">"scripts"</a>: {
    "preinstall": "<your command here>",
    "postinstall": "<your command here>",
    "preuninstall": "<your command here>"
  },
  <a href="#ignoreddependencies">"ignoredDependencies"</a>: [
    "jquery"
  ]
}</code></pre>


### cwd

`String`

Current working directory - the directory from which bower should run. All relative paths will be calculated according to this setting. It should be used only via programmatic API or CLI arguments. Do not put it into `.bowerrc`.

```json
"cwd": "~/my-project"
```

### directory

`String`

The path in which installed components should be saved. If not specified this defaults to `bower_components`.

```json
"directory": "bower_components"
```

### registry

`Object` or `String`

The registry config. Can be an object or a string. If a string is used, all the property values below will have its value. Defaults to the bower registry URL.

If your organization wishes to maintain a private registry, you may change the values below.

```json
"registry": "https://bower.herokuapp.com"
```

#### registry.search

`Array` of `String` or `String`

An array of URLs pointing to read-only Bower registries. A string means only one. When looking into the registry for an endpoint, Bower will query these registries by the specified order.

```json
"registry": {
  "search": [
    "http://localhost:8000",
    "https://bower.herokuapp.com"
  ]
}
```

#### registry.register

`String`

The URL to use when registering packages.

```json
"registry": {
  "register": "http://localhost:8000"
}
```


#### registry.publish

`String`

The URL to use when publishing packages.

```json
"registry": {
  "publish": "http://localhost:8000"
}
```

### shorthand-resolver

`String`

Define a custom template for shorthand package names.
Defaults to {% raw %}`git://github.com/{{owner}}/{{package}}.git`{% endraw %}

The `shorthand-resolver` key provides support for defining a custom template
which Bower uses when constructing a URL for a given shorthand. For example, if
a shorthand of `twitter/flight` or `twitter/flight#v1.0.0` is specified in the
package's manifest dependencies, the following data can be referenced from
within the `shorthand-resolver` template:

    owner: "twitter"
    package: "flight"
    shorthand: "twitter/flight"

```json
"shorthand-resolver": "git://example.com/{{owner}}/components/{{package}}.git"
```

```json
"shorthand-resolver": "git://example.com/{{shorthand}}.git"
```

### proxy

`String`

The proxy to use for http requests.

```json
"proxy":"http://<host>:<port>"
```


### https-proxy

`String`

The proxy to use for https requests.

```json
"https-proxy":"http://<host>:<port>"
```

### user-agent

`String`

Sets the User-Agent for each request made.
Defaults to: `node/<process.version> <process.platform> <process.arch>`

```json
"user-agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
```

### timeout

`Number`

The timeout to be used when making requests in milliseconds, defaults to
`60000` ms.

```json
"timeout": 40000
```

### strict-ssl

`Boolean`

Whether or not to do SSL key validation when making requests via https.

```json
"strict-ssl": false
```

### ca

`Object` or `String`

The CA certificates to be used, defaults to null. This is similar to the
registry key, specifying each CA to use for each registry endpoint.

The Certificate Authority signing certificate that is trusted for SSL
connections to the registry.
Set to null to only allow "known" registrars, or to a specific CA cert to trust
only that specific signing authority.

```json
"ca": "/etc/ssl/cert.pem"
```

### color

`Boolean`

Enable or disable use of colors in the CLI output. Defaults to true.

```json
"color": true
```

### storage

`Object`

Where to store persistent data, such as cache, needed by bower. Defaults to
paths that suit the OS/platform. Valid keys are `packages`, `registry`, `links`.


```json
"storage": {
  "packages" : "~/.bower/packages",
  "registry" : "~/.bower/registry",
  "links" : "~/.bower/links"
}
```

### tmp

`String`

Where to store temporary files and folders. Defaults to the system temporary
directory suffixed with /bower.

```json
"tmp": "~/.bower/tmp"
```

### interactive

`Boolean`

Makes bower interactive, prompting whenever necessary. Defaults to `null` which
means `auto`.

```json
"interactive": true
```

### resolvers

`Array` of `String`

List of [Pluggable Resolvers](http://bower.io/docs/pluggable-resolvers/) to use for locating and fetching packages.


```json
"resolvers": [
  "mercurial-bower-resolver"
]
```

### shallowCloneHosts

`Array` of `String`

Bower's default behavior is to not use _shallow cloning_, since some Git hosts (e.g. older versions of GitHub Enterprise) fail to provide a response when asked to do a shallow clone (with `--depth 1`). This list allows to whitelist hosts that are known to support shallow cloning.


```json
"shallowCloneHosts": [
  "myGitHost.example.com"
]
```

### scripts

Bower provides 3 separate hooks that can be used to trigger other automated tools during Bower usage.  Importantly, these hooks are intended to allow external tools to help wire up the newly installed components into the parent project and other similar tasks.  These hooks are not intended to provide a post-installation build step for component authors.  As such, the configuration for these hooks is provided in the `.bowerrc` file in the parent project's directory.

In `.bowerrc` do:

```js
{
    "scripts": {
        "preinstall": "<your command here>",
        "postinstall": "<your command here>",
        "preuninstall": "<your command here>"
    }
}
```

The value of each script hook may contain a % character.  When your script is called, the % will be replaced with a space-separated list of components being installed or uninstalled.

Your script will also include an environment variable `BOWER_PID` containing the PID of the parent Bower process that triggered the script.  This can be used to verify that a `preinstall` and `postinstall` steps are part of the same Bower process.

### ignoredDependencies

`Array`

Bower will ignore these dependencies when resolving packages.

```json
"ignoredDependencies": [
  "jquery", "angular"
]
```
