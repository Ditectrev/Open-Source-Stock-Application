#!/bin/bash

# Test script for Market Data API endpoints
# Run this after starting the dev server with: bun run dev

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Market Data API Endpoint Tests${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Function to test an endpoint
test_endpoint() {
    local name=$1
    local url=$2
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo -e "URL: ${url}\n"
    
    response=$(curl -s -w "\n%{http_code}" "${url}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Success (HTTP ${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed (HTTP ${http_code})${NC}"
        echo "$body"
    fi
    
    echo -e "\n${BLUE}----------------------------------------${NC}\n"
}

# Test 1: Symbol Data
test_endpoint "Get Symbol Data (AAPL)" "${BASE_URL}/api/market/symbol/AAPL"

# Test 2: Historical Data
test_endpoint "Get Historical Data (AAPL, 1M)" "${BASE_URL}/api/market/historical/AAPL?range=1M"

# Test 3: Technical Indicators
test_endpoint "Get Technical Indicators (AAPL)" "${BASE_URL}/api/market/indicators/AAPL"

# Test 4: Forecast Data
test_endpoint "Get Forecast Data (AAPL)" "${BASE_URL}/api/market/forecast/AAPL"

# Test 5: Seasonal Patterns
test_endpoint "Get Seasonal Patterns (AAPL)" "${BASE_URL}/api/market/seasonal/AAPL"

# Test 6: Financials
test_endpoint "Get Financials (AAPL)" "${BASE_URL}/api/market/financials/AAPL"

# Test 7: Fear & Greed Index
test_endpoint "Get Fear & Greed Index" "${BASE_URL}/api/market/fear-greed"

# Test 8: World Markets
test_endpoint "Get World Markets" "${BASE_URL}/api/market/world-markets"

# Test 9: Sector Performance
test_endpoint "Get Sector Performance" "${BASE_URL}/api/market/sectors"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Test Suite Complete${NC}"
echo -e "${BLUE}============================================${NC}\n"

echo -e "${YELLOW}Note: Some tests may fail if external APIs are not accessible.${NC}"
echo -e "${YELLOW}This is expected in a local development environment.${NC}\n"
