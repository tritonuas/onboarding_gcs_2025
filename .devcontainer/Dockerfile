# Use a standard Microsoft dev container base image for a good foundation
FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Define versions as arguments to easily update them later
ARG GO_VERSION=1.21.1
ARG PROTOC_VERSION=25.1

# Install essential system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    make git curl unzip build-essential

# --- Install Go ---
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH
RUN curl -sL "https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -C /usr/local -xz
RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

# --- Install Node.js (LTS version) ---
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# --- Install Protobuf Compiler (protoc) ---
RUN curl -sLo /tmp/protoc.zip "https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-x86_64.zip" \
    && unzip /tmp/protoc.zip -d /usr/local \
    && rm /tmp/protoc.zip

# --- Install Go plugin for Protobuf ---
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# [Optional] Set the default user. The base image creates a non-root user 'vscode'
# This is good practice for security and file permissions.
USER vscode