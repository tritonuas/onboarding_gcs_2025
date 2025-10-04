package server

import (
    "encoding/json"
    "io"
    "log"
    "net/http"

    "gcs-onboarding/internal/obc"
    "gcs-onboarding/internal/protos"

    "github.com/gin-gonic/gin"
    "google.golang.org/protobuf/encoding/protojson"
)

// Server holds the dependencies for the HTTP server.
type Server struct {
	obcClient *obc.Client
	router    *gin.Engine
}

func New(obcClient *obc.Client) *Server {
	s := &Server{
		obcClient: obcClient,
	}
	s.setupRouter()
	return s
}

func (s *Server) setupRouter() {
	router := gin.Default()
	router.Use(CORSMiddleware())
    router.Use(NoCacheMiddleware())

	api := router.Group("/api/v1")
	{
		api.GET("/obc/status", s.getOBCStatus())
		api.POST("/obc/message", s.postMessage())
        api.GET("/obc/tick", s.getOBCTick())
        api.GET("/obc/capture", s.getOBCCapture())
	}

	s.router = router
}

func (s *Server) Start(port string) {
	err := s.router.Run(port)
	if err != nil {
		log.Fatalf("Failed to start Gin server: %v", err)
	}
}

// handler for /api/v1/obc/status 
func (s *Server) getOBCStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Handler invoked: Proxying request to OBC.")

		body, statusCode := s.obcClient.GetStatus()

		if statusCode != http.StatusOK {
			log.Printf("Error from OBC client. Status: %d", statusCode)
			c.JSON(statusCode, gin.H{"error": "Failed to get status from OBC."})
			return
		}

		c.Data(http.StatusOK, "application/json", body)
	}
}

// handler for /api/v1/obc/message
func (s *Server) postMessage() gin.HandlerFunc {
	return func(c *gin.Context) {
        var detectedObject protos.DetectedObject
        body, readErr := io.ReadAll(c.Request.Body)
        if readErr != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": readErr.Error()})
            return
        }

        unmarshalOpts := protojson.UnmarshalOptions{DiscardUnknown: true}
        if err := unmarshalOpts.Unmarshal(body, &detectedObject); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

		respBody, status := s.obcClient.PostMessage(&detectedObject)

        // Serialize the request object using protojson
        reqJSON, err := protojson.Marshal(&detectedObject)
        if err != nil {
            // Fall back to plain error if serialization fails
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to marshal request proto"})
            return
        }

        // Try to decode upstream body as JSON, otherwise include as string
        var upstream interface{}
        if len(respBody) > 0 {
            var tmp interface{}
            if json.Unmarshal(respBody, &tmp) == nil {
                upstream = tmp
            } else {
                upstream = string(respBody)
            }
        }

        // Wrap in a JSON envelope
        c.JSON(status, gin.H{
            "request": json.RawMessage(reqJSON),
            "upstream_status": status,
            "upstream_body": upstream,
        })
	}
}

// handler for /api/v1/obc/tick
func (s *Server) getOBCTick() gin.HandlerFunc {
    return func(c *gin.Context) {
        log.Println("Handler invoked: Proxying tick request to OBC.")

        body, statusCode := s.obcClient.GetTick()

        if statusCode != http.StatusOK {
            log.Printf("Error from OBC client tick. Status: %d", statusCode)
            c.JSON(statusCode, gin.H{"error": "Failed to get tick from OBC."})
            return
        }

        c.Data(http.StatusOK, "text/plain; charset=utf-8", body)
    }
}


// handler for /api/v1/obc/capture
func (s *Server) getOBCCapture() gin.HandlerFunc {
    return func(c *gin.Context) {
        log.Println("Handler invoked: Proxying capture request to OBC.")

        body, statusCode := s.obcClient.GetCapture()

        if statusCode != http.StatusOK {
            log.Printf("Error from OBC client. Status: %d", statusCode)
            c.JSON(statusCode, gin.H{"error": "Failed to get image from OBC."})
            return
        }

        c.Data(http.StatusOK, "text/plain; charset=utf-8", body)
    }
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

// NoCacheMiddleware sets HTTP headers to prevent caching of API responses
func NoCacheMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Disable caching for dynamic API responses
        c.Writer.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        c.Writer.Header().Set("Pragma", "no-cache")
        c.Writer.Header().Set("Expires", "0")
        c.Writer.Header().Set("Surrogate-Control", "no-store")
        c.Next()
    }
}