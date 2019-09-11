# Private Labeling #

Setting `/v3/settings/ui-pl` to a value other than `rancher` will:
  - Change (most) places that say "Rancher" in the UI to the value you provide.
    - This does not include things like "rancher-compose.yml" that are expected to have a certain name.
  - Disable the footer and help links to Rancher Labs-specific docs, forums, and repos.
  - Change the loading screen to a generic spinner.
  - Remove the animations/images to make the error screen generic.

You can set this manually/through the API after installation, or by setting the `CATTLE_UI_PL` environment 
variable when running the `rancher/rancher` container.

# Images #
This folder contains all the images that have the Rancher-specific content in them.
You can replace them by running the `rancher/rancher` container with:

```-v /path/to/your/logos:/usr/share/rancher/ui/assets/images/logos```

This replaces the entire folder, so you must supply all the files or they will be missing.

| File                        | Usage                                                     |
|:--------------------------- |:----------------------------------------------------------|
| dark.svg                    | On the Login screen when access control is enabled        |
| fail-*.svg                  | On the branded error screen (for ui.pl="rancher" only)    |
| favicon.ico                 | Browser tab favicon                                       |
| graphic.svg                 | The parachuting cow part of the image on the About screen |
| login-bg.jpg                | Background for the login screen box                       |
| main.svg                    | Top-left corner of the main header                        |
| main-loading.svg            | On the branded loading screen (for ui.pl="rancher" only)  |
| provider-custom.svg         | Custom "Add Host" provider                                |
| provider-local.svg          | Local "Access Control" provider                           |
| provider-orchestration.svg  | "Cattle" environment orchestration provider               |
| text.svg                    | The text part of the image on the About screen            |
