#!/bin/bash

echo "Testing Mintapply API..."

# Test health endpoint
echo "1. Testing health endpoint:"
curl -s http://localhost:3001/health
echo

# Test cover letter generation
echo "2. Testing cover letter generation:"
curl -X POST http://localhost:3001/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"title": "Software Engineer", "jd": "We are looking for a passionate software engineer to join our team", "uid": "anonymous"}' \
  -s | jq .

echo
echo "Test complete!"