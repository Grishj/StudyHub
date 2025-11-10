#!/bin/bash
# ===================================================
# PSC Study App – Full API Automated Test Script
# ===================================================

BASE_URL="http://localhost:5000/api/v1"
EMAIL="user@example.com"
PASSWORD="password123"

GREEN="\033[0;32m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

echo -e "${BLUE}🔹 Logging in to get JWT...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed!${NC}"
  echo "$LOGIN_RESPONSE" | jq
  exit 1
fi
echo -e "${GREEN}✅ Login success! Token received.${NC}"

# -------------------------------------------
# Helper function for testing endpoints
# -------------------------------------------
test_api() {
  METHOD=$1
  ENDPOINT=$2
  DATA=$3
  PROTECTED=$4

  if [ "$PROTECTED" == "true" ]; then
    AUTH_HEADER="-H \"Authorization: Bearer $TOKEN\""
  else
    AUTH_HEADER=""
  fi

  CMD="curl -s -o tmp.json -w \"%{http_code}\" -X $METHOD \"$BASE_URL$ENDPOINT\" \
    -H \"Content-Type: application/json\" $AUTH_HEADER -d '$DATA'"

  STATUS_CODE=$(eval $CMD)

  SUCCESS=$(jq -r '.success' tmp.json 2>/dev/null)

  if [[ "$STATUS_CODE" =~ ^2 ]] || [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ [$METHOD] $ENDPOINT (${STATUS_CODE})${NC}"
  else
    echo -e "${RED}❌ [$METHOD] $ENDPOINT (${STATUS_CODE})${NC}"
    cat tmp.json | jq
  fi
}

# ===================================================
# AUTHENTICATION
# ===================================================
echo -e "\n${BLUE}=== AUTHENTICATION ===${NC}"
test_api "POST" "/auth/register" '{"email":"test@demo.com","password":"demo123","fullName":"Demo User"}' "false"
test_api "POST" "/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "false"
test_api "POST" "/auth/logout" "" "true"
test_api "POST" "/auth/forgot-password" '{"email":"demo@demo.com"}' "false"
test_api "POST" "/auth/reset-password" '{"token":"dummy","newPassword":"newpass"}' "false"
test_api "POST" "/auth/refresh-token" "" "false"
test_api "GET" "/auth/profile" "" "true"

# ===================================================
# PROFILE
# ===================================================
echo -e "\n${BLUE}=== PROFILE ===${NC}"
test_api "GET" "/profile/me" "" "true"
test_api "GET" "/profile/me/stats" "" "true"
test_api "GET" "/profile/me/achievements" "" "true"

# ===================================================
# CATEGORIES
# ===================================================
echo -e "\n${BLUE}=== CATEGORIES ===${NC}"
test_api "GET" "/categories" "" "false"
test_api "GET" "/categories/name/General%20Knowledge" "" "false"

# ===================================================
# SYLLABUS
# ===================================================
echo -e "\n${BLUE}=== SYLLABUS ===${NC}"
test_api "GET" "/syllabus" "" "false"

# ===================================================
# NOTES
# ===================================================
echo -e "\n${BLUE}=== NOTES ===${NC}"
test_api "GET" "/notes" "" "false"
test_api "POST" "/notes" '{"title":"API note","content":"testing note"}' "true"

# ===================================================
# QUIZZES
# ===================================================
echo -e "\n${BLUE}=== QUIZZES ===${NC}"
test_api "GET" "/quizzes" "" "false"
test_api "GET" "/quizzes/daily" "" "false"
test_api "POST" "/quizzes" '{"title":"Demo Quiz"}' "true"

# ===================================================
# GROUPS
# ===================================================
echo -e "\n${BLUE}=== GROUPS ===${NC}"
test_api "GET" "/groups" "" "false"

# ===================================================
# SEARCH
# ===================================================
echo -e "\n${BLUE}=== SEARCH ===${NC}"
test_api "GET" "/search?q=test" "" "false"

# ===================================================
# BOOKMARKS
# ===================================================
echo -e "\n${BLUE}=== BOOKMARKS ===${NC}"
test_api "GET" "/bookmarks" "" "true"

# ===================================================
# NOTIFICATIONS
# ===================================================
echo -e "\n${BLUE}=== NOTIFICATIONS ===${NC}"
test_api "GET" "/notifications" "" "true"

# ===================================================
# REPORTS
# ===================================================
echo -e "\n${BLUE}=== REPORTS ===${NC}"
test_api "GET" "/reports/my" "" "true"

# ===================================================
# UPLOAD
# ===================================================
echo -e "\n${BLUE}=== UPLOAD ===${NC}"
test_api "GET" "/upload" "" "true"

echo -e "\n${GREEN}🎯 All tests executed.${NC}"
rm -f tmp.json
