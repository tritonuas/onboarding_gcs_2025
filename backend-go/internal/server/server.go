package server

import (
	"log"
	"net/http"

	"gcs-onboarding/internal/obc"
	"github.com/gin-gonic/gin"
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

	api := router.Group("/api/v1")
	{
		api.GET("/obc/status", s.getOBCStatus())
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