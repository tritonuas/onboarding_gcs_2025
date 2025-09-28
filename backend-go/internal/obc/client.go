package obc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type Client struct {
	httpClient *http.Client
	urlBase    string
}

func NewClient(obcAddr string) *Client {
	return &Client{
		httpClient: &http.Client{},
		urlBase:    fmt.Sprintf("http://%s", obcAddr),
	}
}

// GetStatus retrieves the status from the OBC's /status endpoint.
// It returns the response body and the HTTP status code.
func (c *Client) GetStatus() ([]byte, int) {
	// Construct the full URL for the request
	requestURL := fmt.Sprintf("%s/status", c.urlBase)

	// Perform the GET request
	resp, err := c.httpClient.Get(requestURL)
	if err != nil {
		// If there's a network error, we can't connect.
		log.Printf("FATAL: OBC client request failed with network error: %v", err)

		return nil, http.StatusBadGateway
	}
	defer resp.Body.Close()

	// Read the response body from the OBC
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		// If we can't read the body, it's an internal server error.
		return nil, http.StatusInternalServerError
	}

	// Return the body and the status code from the OBC's response
	return body, resp.StatusCode
}

// PostMessage sends a message to the OBC's /message endpoint.
// It returns the response body and the HTTP status code.
func (c *Client) PostMessage(message interface{}) ([]byte, int) {
	// Construct the full URL for the request
	requestURL := fmt.Sprintf("%s/message", c.urlBase)

	// Convert message to JSON
	var requestBody io.Reader
	if message != nil {
		jsonData, err := json.Marshal(message)
		if err != nil {
			log.Printf("Error marshaling message to JSON: %v", err)
			return nil, http.StatusBadRequest
		}
		requestBody = bytes.NewBuffer(jsonData)
	}

	// Perform the POST request
	resp, err := c.httpClient.Post(requestURL, "application/json", requestBody)
	if err != nil {
		// If there's a network error, we can't connect.
		log.Printf("FATAL: OBC client request failed with network error: %v", err)

		return nil, http.StatusBadGateway
	}
	defer resp.Body.Close()

	// Read the response body from the OBC
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		// If we can't read the body, it's an internal server error.
		return nil, http.StatusInternalServerError
	}

	// Return the body and the status code from the OBC's response
	return body, resp.StatusCode
}