package obc

import (
	"fmt"
	"io"
	"net/http"
	"log"
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


// GetTick retrieves the current tick from the OBC's /tick endpoint.
// It returns the response body and the HTTP status code.
func (c *Client) GetTick() ([]byte, int) {
	// Construct the full URL for the request
	requestURL := fmt.Sprintf("%s/tick", c.urlBase)

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

// GetCapture retrieves the stored image from the OBC's /capture endpoint.
// It returns the response body and the HTTP status code.
func (c *Client) GetCapture() ([]byte, int) {
	// Construct the full URL for the request
	requestURL := fmt.Sprintf("%s/capture", c.urlBase)

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
