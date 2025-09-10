package main

import (
	"log"
	"gcs-onboarding/internal/obc"
	"gcs-onboarding/internal/server"
)

const obcAddress = "localhost:5010"
const serverPort = ":8080"

func main() {
	obcClient := obc.NewClient(obcAddress)
	httpServer := server.New(obcClient)

	log.Printf("Starting GCS server on port %s", serverPort)
	httpServer.Start(serverPort)
}