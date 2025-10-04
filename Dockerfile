# Use Cypress official image with all dependencies
FROM cypress/included:15.3.0

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --include=dev && npm cache clean --force

# Copy Cypress configuration and test files
COPY cypress.config.js ./
COPY cypress/ ./cypress/

# Cypress is already installed in the base image

# Create reports directory
RUN mkdir -p cypress/reports

# Set environment variables
ENV NODE_ENV=production
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

# Set default base URL (can be overridden at runtime)
ENV CYPRESS_baseUrl=https://fakerestapi.azurewebsites.net
ENV CYPRESS_baseApiUrl=https://fakerestapi.azurewebsites.net/api/v1

# Create comprehensive test runner script
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
# Colors for output\n\
RED="\033[0;31m"\n\
GREEN="\033[0;32m"\n\
YELLOW="\033[1;33m"\n\
BLUE="\033[0;34m"\n\
NC="\033[0m" # No Color\n\
\n\
# Function to print colored output\n\
print_status() {\n\
    echo -e "${BLUE}[INFO]${NC} $1"\n\
}\n\
\n\
print_success() {\n\
    echo -e "${GREEN}[SUCCESS]${NC} $1"\n\
}\n\
\n\
print_warning() {\n\
    echo -e "${YELLOW}[WARNING]${NC} $1"\n\
}\n\
\n\
print_error() {\n\
    echo -e "${RED}[ERROR]${NC} $1"\n\
}\n\
\n\
# Start test execution\n\
print_status "Starting Cypress API Tests..."\n\
print_status "Base URL: $CYPRESS_baseUrl"\n\
print_status "API URL: $CYPRESS_baseApiUrl"\n\
print_status "Spec Pattern: ${CYPRESS_SPEC:-cypress/e2e/**/*.cy.js}"\n\
\n\
# Clean previous reports\n\
print_status "Cleaning previous reports..."\n\
rm -rf cypress/reports/mocha/* || true\n\
rm -f cypress/reports/merged-report.* || true\n\
\n\
# Run tests with provided spec pattern or default\n\
print_status "Running Cypress tests..."\n\
if [ -n "$CYPRESS_SPEC" ]; then\n\
  npx cypress run --spec "$CYPRESS_SPEC" --config baseUrl="$CYPRESS_baseUrl" --browser chrome --browser-args="--no-sandbox --disable-dev-shm-usage"\n\
else\n\
  npx cypress run --config baseUrl="$CYPRESS_baseUrl" --browser chrome --browser-args="--no-sandbox --disable-dev-shm-usage"\n\
fi\n\
\n\
# Check if tests completed successfully\n\
TEST_EXIT_CODE=$?\n\
\n\
# Test execution completed\n\
print_status "Test execution completed with exit code: $TEST_EXIT_CODE"\n\
\n\
if [ "$TEST_EXIT_CODE" -eq 0 ]; then\n\
  print_success "All tests passed!"\n\
else\n\
  print_error "Some tests failed!"\n\
fi\n\
\n\
# List generated files\n\
print_status "Generated files:"\n\
ls -la cypress/reports/ || true\n\
\n\
# Exit with test result code\n\
exit $TEST_EXIT_CODE\n\
' > /app/run-tests.sh && chmod +x /app/run-tests.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f $CYPRESS_baseUrl/api/v1/Books || exit 1

# Default command - run tests
CMD ["/bin/bash", "/app/run-tests.sh"]