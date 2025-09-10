
# --- Variables ---
GO_PROTO_FILE := backend-go/internal/protos/onboarding.pb.go
TS_PROTO_FILE := frontend-react/src/protos/onboarding.pb.ts
PROTO_SOURCE  := protos/onboarding.proto
GO_SUM_FILE   := backend-go/go.sum

# --- High-Level Targets ---
.PHONY: all
all: protos
	@echo "Project dependencies are installed and protobufs are generated."
	@echo "Run 'make run-dev' to start the servers."

.PHONY: run-dev
run-dev: $(GO_SUM_FILE) $(GO_PROTO_FILE) $(TS_PROTO_FILE)
	@echo "Starting Go backend (port 8080) and React frontend (port 5173)..."
	@echo "Use the VS Code 'Ports' tab or pop-up to open the application in your browser."
	(cd backend-go && CGO_ENABLED=0 go run main.go) & \
	(cd frontend-react && npm run dev -- --host)

# --- Build & Dependency Targets ---
.PHONY: protos
protos: $(GO_PROTO_FILE) $(TS_PROTO_FILE)

$(GO_SUM_FILE): backend-go/go.mod
	@echo "Tidying Go module dependencies..."
	cd backend-go && go mod tidy

.PHONY: install
install: frontend-react/node_modules

# --- Low-Level Rules ---

$(GO_PROTO_FILE): $(PROTO_SOURCE)
	@echo "Generating Go protobuf code..."
	@mkdir -p $(dir $(GO_PROTO_FILE))
	protoc --proto_path=protos --go_out=backend-go/internal/protos --go_opt=paths=source_relative $(PROTO_SOURCE)

$(TS_PROTO_FILE): $(PROTO_SOURCE) | install
	@echo "Generating TypeScript protobuf code..."
	@mkdir -p $(dir $(TS_PROTO_FILE))
	protoc --proto_path=protos \
		   --plugin=./frontend-react/node_modules/.bin/protoc-gen-ts_proto \
		   --ts_proto_out=./frontend-react/src/protos \
		   --ts_proto_opt=fileSuffix=.pb,esModuleInterop=true \
		   $(PROTO_SOURCE)

frontend-react/node_modules: frontend-react/package.json
	@echo "Installing frontend dependencies (npm install)..."
	cd frontend-react && npm install

.PHONY: clean
clean:
	@echo "Cleaning up generated files and dependencies..."
	@rm -rf backend-go/internal/protos
	@rm -rf frontend-react/src/protos
	@rm -rf backend-go/go.sum
	@rm -rf frontend-react/node_modules
	@go clean -cache