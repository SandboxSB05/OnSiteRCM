#!/bin/bash

# Test the registration API endpoint
# This script tests user registration with the serverless function

echo "Testing user registration endpoint..."
echo ""

# Test data
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"
TEST_NAME="Test User"
TEST_COMPANY="Test Company"
TEST_PHONE="555-1234"

echo "Creating test user with email: $TEST_EMAIL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"company\": \"$TEST_COMPANY\",
    \"phone\": \"$TEST_PHONE\",
    \"password\": \"$TEST_PASSWORD\",
    \"role\": \"contractor\"
  }")

# Extract HTTP status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_STATUS"
echo ""
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check if successful
if [ "$HTTP_STATUS" = "201" ]; then
  echo "✅ Registration successful!"
else
  echo "❌ Registration failed!"
fi
