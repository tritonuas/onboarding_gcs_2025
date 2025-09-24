FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

ARG GO_VERSION=1.21.1
ARG PROTOC_VERSION=25.1

# Install all depdendencies + detect architecture
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends make git curl unzip build-essential \

    # Detect Architecture 
    && NATIVE_ARCH=$(uname -m) \
    && echo "Natively detected architecture: ${NATIVE_ARCH}" \

    && case ${NATIVE_ARCH} in \
        x86_64) \
            GO_ARCH=amd64; \
            PROTOC_ARCH=x86_64; \
            ;; \
        aarch64) \
            GO_ARCH=arm64; \
            PROTOC_ARCH=aarch_64; \
            ;; \
        *) \
            echo "Unsupported architecture: ${NATIVE_ARCH}"; \
            exit 1; \
            ;; \
    esac \

    && echo "Downloading Go for ${GO_ARCH}..." \
    && curl -sL "https://golang.org/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz" | tar -C /usr/local -xz \

    && echo "Downloading Protoc for ${PROTOC_ARCH}..." \
    && curl -sLo /tmp/protoc.zip "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-${PROTOC_ARCH}.zip" \
    && unzip /tmp/protoc.zip -d /usr/local \
    && rm /tmp/protoc.zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

RUN chown -R vscode:vscode /go

USER vscode