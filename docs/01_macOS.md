# macOS Prerequisites

1. Brew https://brew.sh/

2. Docker Desktop https://www.docker.com/products/docker-desktop

```bash
brew install --cask docker
```

3. ASDF https://asdf-vm.com/guide/getting-started.html

```bash
brew install asdf
```

Enable .nvmrc support, more info [here](https://asdf-vm.com/guide/getting-started-legacy.html#using-existing-tool-version-files)

```bash
grep -qF 'legacy_version_file' ~/.asdfrc || echo 'legacy_version_file = yes' >> ~/.asdfrc
```

2. Install **Node.js** specified within `.nvmrc` using `asdf`

```bash
asdf plugin add nodejs && asdf install
```

```shell
npm install -g yarn
```
