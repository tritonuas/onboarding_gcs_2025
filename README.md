# TritonUAS GCS Onboarding

TODO: Write this

## Setup

1. Pre-requisites
- `git`
- [Docker Desktop/Engine](https://docs.docker.com/get-started/get-docker/)
- [Visual Studio Code](https://code.visualstudio.com/download)
    - After VSC is downloaded, download this extension: [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)


2. Clone the Repository and Open in Visual Studio Code.
```bash
# Navigate to directory where you want to start
git clone git@github.com:tritonuas/onboarding_gcs_2025.git
cd onboarding_gcs
code .
```

3. Pull the Dev Container:
    1. In the bottom left of the screen, click on the remote window icon. It should look like two angle brackets next to each other. Also, you can instead press "Ctrl+Shift+P"
    2. Select (or type) reopen in container.
    3. If successful, the bottom-left should say: `Dev Container: GCS Onboarding`.

Now you are set up!!

## Usage:
Most operations including building and running the project is done through the `Makefile`. Here are the main commands:

1. `make protos` - Initalizes the project (Ran Once or when `make clean` is ran)
2. `make clean` - Clears temp/build files
3. `make run-dev` - runs frontend React server + backend go server