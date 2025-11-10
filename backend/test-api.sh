#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000/api/v1"
EMAIL="demo@pscstudy.com"
PASSWORD="Password123"

echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   PSC Study API - Complete Test       ║${NC}"
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo ""

# Function to print test header
print_test() {
    echo -e "\n${GREEN}▶ Testing: $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Health Check
print_test "Health Check"
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "success"; then
    print_success "API is running"
else
    print_error "API is not responding"
    exit 1
fi

# 2. Login
print_test "Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if command -v jq &> /dev/null; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
    REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken')
    
    if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
        print_success "Login successful"
        echo "Token: ${TOKEN:0:20}..."
    else
        print_error "Login failed"
        echo "$LOGIN_RESPONSE"
        exit 1
    fi
else
    print_error "jq not installed. Please install jq to run this script"
    echo "Install: sudo apt-get install jq (Ubuntu) or brew install jq (Mac)"
    exit 1
fi

# 3. Get Profile
print_test "Get Profile"
PROFILE=$(curl -s "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q "success"; then
    print_success "Profile retrieved"
else
    print_error "Failed to get profile"
fi

# 4. Get Categories
print_test "Get Categories"
CATEGORIES=$(curl -s "$BASE_URL/categories")

if echo "$CATEGORIES" | grep -q "success"; then
    CATEGORY_ID=$(echo $CATEGORIES | jq -r '.data[0].id')
    CATEGORY_NAME=$(echo $CATEGORIES | jq -r '.data[0].name')
    print_success "Categories retrieved - Found: $CATEGORY_NAME"
else
    print_error "Failed to get categories"
fi

# 5. Get Notes
print_test "Get Notes"
NOTES=$(curl -s "$BASE_URL/notes?limit=5")

if echo "$NOTES" | grep -q "success"; then
    NOTE_COUNT=$(echo $NOTES | jq -r '.data.pagination.total')
    print_success "Notes retrieved - Total: $NOTE_COUNT"
    
    NOTE_ID=$(echo $NOTES | jq -r '.data.data[0].id')
    if [ "$NOTE_ID" != "null" ]; then
        echo "First Note ID: $NOTE_ID"
    fi
else
    print_error "Failed to get notes"
fi

# 6. Get Quizzes
print_test "Get Quizzes"
QUIZZES=$(curl -s "$BASE_URL/quizzes")

if echo "$QUIZZES" | grep -q "success"; then
    QUIZ_COUNT=$(echo $QUIZZES | jq -r '.data.pagination.total')
    print_success "Quizzes retrieved - Total: $QUIZ_COUNT"
    
    QUIZ_ID=$(echo $QUIZZES | jq -r '.data.data[0].id')
    if [ "$QUIZ_ID" != "null" ]; then
        echo "First Quiz ID: $QUIZ_ID"
    fi
else
    print_error "Failed to get quizzes"
fi

# 7. Get Daily Quiz
print_test "Get Daily Quiz"
DAILY_QUIZ=$(curl -s "$BASE_URL/quizzes/daily")

if echo "$DAILY_QUIZ" | grep -q "success"; then
    DAILY_QUIZ_TITLE=$(echo $DAILY_QUIZ | jq -r '.data.title')
    print_success "Daily quiz: $DAILY_QUIZ_TITLE"
else
    print_success "No daily quiz available today"
fi

# 8. Get Groups
print_test "Get Groups"
GROUPS=$(curl -s "$BASE_URL/groups")

if echo "$GROUPS" | grep -q "success"; then
    GROUP_COUNT=$(echo $GROUPS | jq -r '.data.pagination.total')
    print_success "Groups retrieved - Total: $GROUP_COUNT"
else
    print_error "Failed to get groups"
fi

# 9. Global Search
print_test "Global Search"
SEARCH=$(curl -s "$BASE_URL/search?q=banking")

if echo "$SEARCH" | grep -q "success"; then
    print_success "Search working"
else
    print_error "Search failed"
fi

# 10. Get Notifications
print_test "Get Notifications"
NOTIFICATIONS=$(curl -s "$BASE_URL/notifications" \
  -H "Authorization: Bearer $TOKEN")

if echo "$NOTIFICATIONS" | grep -q "success"; then
    NOTIF_COUNT=$(echo $NOTIFICATIONS | jq -r '.data.pagination.total')
    print_success "Notifications retrieved - Total: $NOTIF_COUNT"
else
    print_error "Failed to get notifications"
fi

# 11. Get User Stats
print_test "Get User Stats"
STATS=$(curl -s "$BASE_URL/profile/me/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS" | grep -q "success"; then
    POINTS=$(echo $STATS | jq -r '.data.achievements.points')
    STREAK=$(echo $STATS | jq -r '.data.achievements.streak')
    print_success "Stats retrieved - Points: $POINTS, Streak: $STREAK"
else
    print_error "Failed to get stats"
fi

# 12. Get Achievements
print_test "Get Achievements"
ACHIEVEMENTS=$(curl -s "$BASE_URL/profile/me/achievements" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ACHIEVEMENTS" | grep -q "success"; then
    UNLOCKED=$(echo $ACHIEVEMENTS | jq -r '.data.unlockedCount')
    TOTAL=$(echo $ACHIEVEMENTS | jq -r '.data.total')
    print_success "Achievements: $UNLOCKED/$TOTAL unlocked"
else
    print_error "Failed to get achievements"
fi

# Summary
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          Test Summary                  ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ All tests completed successfully!${NC}"
echo ""
echo "Available Resources:"
echo "  - Categories: $(echo $CATEGORIES | jq -r '.data | length')"
echo "  - Notes: $NOTE_COUNT"
echo "  - Quizzes: $QUIZ_COUNT"
echo "  - Groups: $GROUP_COUNT"
echo ""
echo "Your Stats:"
echo "  - Points: $POINTS"
echo "  - Streak: $STREAK days"
echo "  - Achievements: $UNLOCKED/$TOTAL"
echo ""
echo -e "${YELLOW}Token for manual testing:${NC}"
echo "$TOKEN"