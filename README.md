An desktop image converter for Ubuntu and Windows, built with Tauri 2.

## Development on Ubuntu

Install the Tauri system dependencies:

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

Install Rust if it is not already installed:

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"
```

Then install the project dependencies and start the desktop app:

```bash
npm install
npm --prefix app ci
npm run desktop:dev
```

## Building Ubuntu Installers

```bash
npm run desktop:build:linux
```

The `.deb` and `.AppImage` packages will be available in `src-tauri/target/release/bundle/`.

## Building for Windows

Build the Windows version on Windows:

```powershell
npm install
npm --prefix app ci
npm run desktop:build:windows
```

The `.msi` and `.exe` installers will be available in `src-tauri/target/release/bundle/`.

Windows builds can also be automated with GitHub Actions.

## Automated Build Versions

For pushes to `main` and manual Actions runs, the workflow run number is added to
the patch version from `src-tauri/tauri.conf.json`. For example, a base version of
`1.0.1` and run number 12 produce version `1.0.13`. Linux and Windows builds use
the same version. Rerunning the same workflow run keeps its version number.
Failed runs also consume run numbers.

Building a tag such as `v1.2.3` uses exactly `1.2.3`. Tags must follow the
`vMAJOR.MINOR.PATCH` format. The version is included in the Actions artifact names.
Version changes are applied only in the CI working copy; no automatic commits
are created. Local builds use the version from `tauri.conf.json`.

## Automated Ubuntu and Windows Builds

The project includes the `.github/workflows/build.yml` workflow. After pushing
the project to GitHub, you can trigger it manually under
**Actions → Build desktop installers → Run workflow**. It creates archives
containing installers for both operating systems.
