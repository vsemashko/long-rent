#!/bin/bash

# Post-Deployment Health Check Script
# Tests deployed production endpoints and services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0
TOTAL_TESTS=0

# Configuration
API_URL="${1:-${API_URL:-https://api.homemore.pl}}"
WEB_URL="${2:-${WEB_URL:-https://homemore.pl}}"
TIMEOUT=10

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
    ((TOTAL_TESTS++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    if [ ! -z "$2" ]; then
        echo -e "${RED}  Error: $2${NC}"
    fi
    ((TESTS_FAILED++))
    ((TOTAL_TESTS++))
}

test_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((TESTS_WARNING++))
    ((TOTAL_TESTS++))
}

test_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is not installed${NC}"
    exit 1
fi

# Start verification
clear
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║      HomeMore Production Health Check                       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Testing deployment at:"
echo "  API: ${API_URL}"
echo "  Web: ${WEB_URL}"
echo ""

# 1. API Health Checks
print_header "1. Backend API Health"

# Test API health endpoint
test_info "Testing ${API_URL}/health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${API_URL}/health" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    test_pass "API health endpoint is responding (HTTP 200)"

    # Get health response
    HEALTH_RESPONSE=$(curl -s --max-time $TIMEOUT "${API_URL}/health")

    # Check if response contains expected fields
    if echo "$HEALTH_RESPONSE" | grep -q "status"; then
        test_pass "Health response contains status field"
    else
        test_warning "Health response missing status field"
    fi

    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "${API_URL}/health")
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
        test_pass "API response time is good (${RESPONSE_TIME}s)"
    else
        test_warning "API response time is slow (${RESPONSE_TIME}s)"
    fi
else
    test_fail "API health endpoint failed" "HTTP ${HTTP_CODE}"
fi

# 2. API Authentication
print_header "2. Authentication Endpoints"

# Test registration endpoint exists
test_info "Testing POST ${API_URL}/api/auth/register..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    -X POST "${API_URL}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{}' || echo "000")

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "422" ]; then
    test_pass "Registration endpoint is responding (HTTP ${HTTP_CODE} - expected for empty body)"
elif [ "$HTTP_CODE" = "201" ]; then
    test_warning "Registration succeeded with empty body (check validation)"
else
    test_fail "Registration endpoint failed" "HTTP ${HTTP_CODE}"
fi

# Test login endpoint exists
test_info "Testing POST ${API_URL}/api/auth/login..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    -X POST "${API_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}' || echo "000")

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "422" ]; then
    test_pass "Login endpoint is responding (HTTP ${HTTP_CODE} - expected for invalid credentials)"
elif [ "$HTTP_CODE" = "200" ]; then
    test_warning "Login succeeded with empty body (check validation)"
else
    test_fail "Login endpoint failed" "HTTP ${HTTP_CODE}"
fi

# 3. API Core Endpoints
print_header "3. Core API Endpoints"

# Test properties endpoint (should require auth or return 401)
test_info "Testing GET ${API_URL}/api/properties..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    "${API_URL}/api/properties" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    test_pass "Properties endpoint is responding (HTTP ${HTTP_CODE})"
else
    test_fail "Properties endpoint failed" "HTTP ${HTTP_CODE}"
fi

# Test search endpoint
test_info "Testing GET ${API_URL}/api/properties/search..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    "${API_URL}/api/properties/search" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
    test_pass "Search endpoint is responding (HTTP ${HTTP_CODE})"
else
    test_fail "Search endpoint failed" "HTTP ${HTTP_CODE}"
fi

# Test profile endpoint (should require auth)
test_info "Testing GET ${API_URL}/api/profile..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    "${API_URL}/api/profile" || echo "000")

if [ "$HTTP_CODE" = "401" ]; then
    test_pass "Profile endpoint requires authentication (HTTP 401)"
elif [ "$HTTP_CODE" = "200" ]; then
    test_warning "Profile endpoint accessible without auth"
else
    test_fail "Profile endpoint failed" "HTTP ${HTTP_CODE}"
fi

# 4. Database Connectivity
print_header "4. Database & Data Layer"

# Test that API can query database (via properties endpoint)
test_info "Testing database connectivity via API..."
PROPERTIES_RESPONSE=$(curl -s --max-time $TIMEOUT "${API_URL}/api/properties/search" || echo "")

if echo "$PROPERTIES_RESPONSE" | grep -q "properties\|data\|\[\]"; then
    test_pass "API can query database successfully"
else
    test_fail "API cannot query database" "Invalid response"
fi

# 5. Frontend Application
print_header "5. Frontend Application"

# Test frontend is accessible
test_info "Testing ${WEB_URL}..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${WEB_URL}" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    test_pass "Frontend is accessible (HTTP 200)"

    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "${WEB_URL}")
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        test_pass "Frontend response time is good (${RESPONSE_TIME}s)"
    else
        test_warning "Frontend response time is slow (${RESPONSE_TIME}s)"
    fi

    # Check if it's actually Next.js
    RESPONSE=$(curl -s --max-time $TIMEOUT "${WEB_URL}")
    if echo "$RESPONSE" | grep -q "next\|__next\|_next"; then
        test_pass "Frontend is a Next.js application"
    else
        test_warning "Frontend might not be Next.js (check deployment)"
    fi
else
    test_fail "Frontend is not accessible" "HTTP ${HTTP_CODE}"
fi

# Test static assets
test_info "Testing static assets..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${WEB_URL}/favicon.ico" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    test_pass "Static assets are being served"
else
    test_warning "Favicon not found (might be missing)"
fi

# 6. SSL/TLS Configuration
print_header "6. Security & SSL"

# Test HTTPS is enforced
test_info "Testing HTTPS enforcement..."
if [[ $WEB_URL == https://* ]]; then
    # Test if HTTP redirects to HTTPS
    HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "http://$(echo $WEB_URL | sed 's/https:\/\///')" || echo "000")
    if [ "$HTTP_REDIRECT" = "301" ] || [ "$HTTP_REDIRECT" = "302" ] || [ "$HTTP_REDIRECT" = "307" ] || [ "$HTTP_REDIRECT" = "308" ]; then
        test_pass "HTTP redirects to HTTPS (HTTP ${HTTP_REDIRECT})"
    else
        test_warning "HTTP does not redirect to HTTPS (HTTP ${HTTP_REDIRECT})"
    fi
else
    test_warning "Not using HTTPS (production should use HTTPS)"
fi

# Test SSL certificate
if [[ $WEB_URL == https://* ]]; then
    test_info "Testing SSL certificate..."
    if command -v openssl &> /dev/null; then
        DOMAIN=$(echo $WEB_URL | sed 's/https:\/\///' | sed 's/\/.*//')
        SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")

        if [ ! -z "$SSL_INFO" ]; then
            test_pass "SSL certificate is valid"

            # Check expiration
            EXPIRY=$(echo "$SSL_INFO" | grep "notAfter" | cut -d'=' -f2)
            test_info "Certificate expires: $EXPIRY"
        else
            test_warning "Could not verify SSL certificate"
        fi
    else
        test_info "OpenSSL not available, skipping SSL certificate check"
    fi
fi

# Test security headers
test_info "Testing security headers..."
HEADERS=$(curl -s -I --max-time $TIMEOUT "${WEB_URL}" || echo "")

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    test_pass "HSTS header is set"
else
    test_warning "HSTS header not found (recommended for production)"
fi

if echo "$HEADERS" | grep -qi "x-frame-options"; then
    test_pass "X-Frame-Options header is set"
else
    test_warning "X-Frame-Options header not found"
fi

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    test_pass "X-Content-Type-Options header is set"
else
    test_warning "X-Content-Type-Options header not found"
fi

# 7. CORS Configuration
print_header "7. CORS Configuration"

test_info "Testing CORS headers..."
CORS_HEADERS=$(curl -s -I --max-time $TIMEOUT \
    -H "Origin: ${WEB_URL}" \
    "${API_URL}/health" || echo "")

if echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin"; then
    CORS_ORIGIN=$(echo "$CORS_HEADERS" | grep -i "access-control-allow-origin" | cut -d':' -f2- | tr -d ' \r\n')
    if [ "$CORS_ORIGIN" = "${WEB_URL}" ] || [ "$CORS_ORIGIN" = "*" ]; then
        test_pass "CORS is configured (Origin: ${CORS_ORIGIN})"
    else
        test_warning "CORS origin mismatch (expected ${WEB_URL}, got ${CORS_ORIGIN})"
    fi
else
    test_fail "CORS headers not found" "Frontend may not be able to access API"
fi

# 8. API Documentation
print_header "8. API Documentation"

# Test if Swagger/OpenAPI docs are available
test_info "Testing API documentation..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${API_URL}/api/docs" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    test_pass "API documentation is available at /api/docs"
elif [ "$HTTP_CODE" = "404" ]; then
    test_warning "API documentation not found (optional for production)"
else
    test_info "API docs status: HTTP ${HTTP_CODE}"
fi

# 9. Error Handling
print_header "9. Error Handling"

# Test 404 handling
test_info "Testing 404 error handling..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT \
    "${API_URL}/api/nonexistent-endpoint-12345" || echo "000")

if [ "$HTTP_CODE" = "404" ]; then
    test_pass "404 errors are handled correctly"
else
    test_warning "404 handling might not be configured (got HTTP ${HTTP_CODE})"
fi

# Test 500 error handling (try to trigger validation error)
test_info "Testing error responses..."
ERROR_RESPONSE=$(curl -s --max-time $TIMEOUT \
    -X POST "${API_URL}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"invalid": "data"}')

if echo "$ERROR_RESPONSE" | grep -q "error\|message\|statusCode"; then
    test_pass "Error responses are properly formatted"
else
    test_warning "Error response format might need improvement"
fi

# 10. Performance Checks
print_header "10. Performance Metrics"

# Test API average response time (5 requests)
test_info "Testing API average response time (5 requests)..."
TOTAL_TIME=0
for i in {1..5}; do
    TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "${API_URL}/health")
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc -l)
done
AVG_TIME=$(echo "scale=3; $TOTAL_TIME / 5" | bc -l)

if (( $(echo "$AVG_TIME < 0.5" | bc -l) )); then
    test_pass "API average response time is excellent (${AVG_TIME}s)"
elif (( $(echo "$AVG_TIME < 1.0" | bc -l) )); then
    test_pass "API average response time is good (${AVG_TIME}s)"
else
    test_warning "API average response time is slow (${AVG_TIME}s)"
fi

# Test frontend average response time (3 requests)
test_info "Testing frontend average response time (3 requests)..."
TOTAL_TIME=0
for i in {1..3}; do
    TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "${WEB_URL}")
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc -l)
done
AVG_TIME=$(echo "scale=3; $TOTAL_TIME / 3" | bc -l)

if (( $(echo "$AVG_TIME < 1.0" | bc -l) )); then
    test_pass "Frontend average response time is excellent (${AVG_TIME}s)"
elif (( $(echo "$AVG_TIME < 2.0" | bc -l) )); then
    test_pass "Frontend average response time is good (${AVG_TIME}s)"
else
    test_warning "Frontend average response time is slow (${AVG_TIME}s)"
fi

# Summary
print_header "Verification Summary"

echo ""
echo -e "${GREEN}✓ Passed:  ${TESTS_PASSED}${NC}"
echo -e "${YELLOW}⚠ Warnings: ${TESTS_WARNING}${NC}"
echo -e "${RED}✗ Failed:  ${TESTS_FAILED}${NC}"
echo -e "─────────────────"
echo -e "Total:     ${TOTAL_TESTS}"
echo ""

# Overall assessment
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

if [ $TESTS_FAILED -eq 0 ]; then
    if [ $TESTS_WARNING -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}║  ✓ All tests passed! Production is healthy.          ║${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Deployment is fully operational!"
        echo ""
        echo "Next steps:"
        echo "  1. Set up monitoring alerts"
        echo "  2. Configure Stripe webhooks"
        echo "  3. Test user registration flow manually"
        echo "  4. Run end-to-end tests"
        echo ""
        exit 0
    else
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}║  ✓ Production is operational with minor warnings.    ║${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Pass rate: ${PASS_RATE}%"
        echo ""
        echo "Review warnings above and address if needed."
        echo ""
        exit 0
    fi
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                       ║${NC}"
    echo -e "${YELLOW}║  ⚠ Production is partially operational.              ║${NC}"
    echo -e "${YELLOW}║                                                       ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Pass rate: ${PASS_RATE}%"
    echo ""
    echo "Some features may not work correctly. Review failed tests above."
    echo ""
    exit 1
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║  ✗ Critical issues detected in production.           ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Pass rate: ${PASS_RATE}%"
    echo ""
    echo "Deployment has significant issues. Review all failed tests."
    echo ""
    exit 1
fi
