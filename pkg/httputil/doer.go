package httputil

import (
	"net/http"
)

// Doer captures the Do method of an http.Client
// https://www.0value.com/let-the-doer-do-it
type Doer interface {
	Do(*http.Request) (*http.Response, error)
}
