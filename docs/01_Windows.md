# Windows Prerequisites

1. Git Bash https://git-scm.com/downloads/win

```shell
winget install --id Git.Git -e --source winget
```

You can run git bash from the start menu, or from VS Code.

2. Setup bash ssh key

```shell
ssh-keygen -t ed25519 -C "name.surname@povio.com"
```

You can add the key to your github account
```shell
cat ~/.ssh/id_ed25519.pub
```

3. Docker Desktop https://www.docker.com/products/docker-desktop

```shell
winget install -e --id Docker.DockerDesktop
```

4. Nvm For Windows https://github.com/coreybutler/nvm-windows

```shell
winget install -e --id CoreyButler.NVMforWindows
```

5. Install Node.js

> Note, if you get an nvm does not exist error, you need to disable `Terminal>Integrated>Env: Enable Persistent Sessions`

```shell
nvm install `cat .nvmrc`
nvm use `cat .nvmrc`
```

```shell
npm install -g yarn
```
