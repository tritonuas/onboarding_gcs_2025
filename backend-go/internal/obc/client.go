package obc

import (
	"fmt"
	"io"
	"net/http"
)

// Client is a client for interacting with the OBC's HTTP API.
type Client struct {
	httpClient *http.Client
	urlBase    string
}

// NewClient creates a new OBC client.
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