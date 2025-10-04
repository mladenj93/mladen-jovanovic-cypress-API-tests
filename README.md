# 🔬 Cypress API Automation Test Framework

## 📖 Overview

This is a simplified API automation testing framework built with **Cypress** for testing the FakeRestAPI. The framework uses Docker for consistent test execution and includes comprehensive reporting capabilities.

## 🏗️ Project Structure

```
mladen-jovanovic-cypress-API-tests/
├── .github/
│   └── workflows/
│       └── cypress-tests.yml          # Simplified GitHub Actions CI/CD pipeline
├── cypress/
│   ├── e2e/
│   │   ├── books/
│   │   │   ├── books-crud.cy.js       # Books CRUD operations tests
│   │   │   └── books-edge-cases.cy.js # Books edge cases and validation
│   │   └── authors/
│   │       ├── authors-crud.cy.js     # Authors CRUD operations tests
│   │       └── authors-edge-cases.cy.js # Authors edge cases and validation
│   ├── fixtures/
│   │   ├── books.json                 # Test data for books
│   │   └── authors.json               # Test data for authors
│   ├── support/
│   │   ├── api-helpers.js             # Reusable API helper classes
│   │   ├── commands.js                # Custom Cypress commands
│   │   └── e2e.js                     # Global configuration and setup
│   └── reports/                       # Generated test reports
├── cypress.config.js                  # Cypress configuration
├── package.json                       # Node.js dependencies and scripts
├── Dockerfile                         # Docker container configuration
├── docker-compose.yml                 # Single Docker Compose service (uses 'docker compose' command)
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (uses `docker compose` command - newer syntax)
- **Node.js** 16+ and npm (for local development)

**Note**: This project uses the built-in `spec` reporter for reliable test execution in Docker containers.

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd mladen-jovanovic-cypress-API-tests

# Install dependencies (for local development)
npm install
```

### 2. Running Tests

#### Using Docker Compose (Recommended)

```bash
# Run all tests
npm run docker:test

# Run specific test suites
npm run docker:test:books      # Books API tests only
npm run docker:test:authors    # Authors API tests only
npm run docker:test:edge       # Edge cases tests only

# Run with custom environment
CYPRESS_BASE_URL=http://localhost:3000 npm run docker:test

# Run with custom spec pattern
CYPRESS_SPEC=cypress/e2e/books/books-crud.cy.js npm run docker:test
```

#### Direct Docker Commands

```bash
# Build and run tests
docker compose up --build --abort-on-container-exit

# Run with custom environment variables
CYPRESS_BASE_URL=http://localhost:3000 docker compose up --build --abort-on-container-exit

# Run specific tests
CYPRESS_SPEC=cypress/e2e/books/**/*.cy.js docker compose up --build --abort-on-container-exit
```

#### Local Development (without Docker)

```bash
# Open Cypress Test Runner (GUI)
npm run cy:open

# Run all tests locally
npm test

# Run specific test suites
npm run test:books      # Books API tests only
npm run test:authors    # Authors API tests only

# Generate reports
npm run generate:report
```

## 🚀 Step-by-Step Local Testing Guide

### Prerequisites Setup

1. **Install Docker Desktop**
   ```bash
   # Download and install Docker Desktop from:
   # https://www.docker.com/products/docker-desktop/
   
   # Verify installation
   docker --version
   docker compose --version
   ```

2. **Install Node.js (for local development)**
   ```bash
   # Download Node.js 16+ from:
   # https://nodejs.org/
   
   # Verify installation
   node --version
   npm --version
   ```

3. **Clone and Setup Project**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd mladen-jovanovic-cypress-API-tests
   
   # Install dependencies
   npm install
   ```

### Running Tests Locally

#### Method 1: Using Docker Compose (Recommended)

**Step 1: Run All Tests**
```bash
# This will build the Docker image and run all 70 tests
npm run docker:test
```

**Step 2: Run Specific Test Suites**
```bash
# Run only Books API tests (20 tests)
npm run docker:test:books

# Run only Authors API tests (20 tests)
npm run docker:test:authors

# Run only Edge Cases tests (30 tests)
npm run docker:test:edge
```

**Step 3: Run with Custom Environment**
```bash
# Test against local API
CYPRESS_BASE_URL="http://localhost:3000" npm run docker:test

# Test specific file
CYPRESS_SPEC="cypress/e2e/books/books-crud.cy.js" npm run docker:test
```

**Step 4: View Test Results**
```bash
# Test reports are automatically generated in:
# - cypress/reports/merged-report.html (HTML dashboard)
# - cypress/reports/merged-report.json (JSON data)
# - cypress/screenshots/ (failure screenshots)
# - cypress/videos/ (test execution videos)

# Open HTML report in browser
start cypress/reports/merged-report.html  # Windows
open cypress/reports/merged-report.html   # macOS
xdg-open cypress/reports/merged-report.html # Linux
```

#### Method 2: Direct Docker Commands

**Step 1: Build and Run**
```bash
# Build the Docker image
docker compose build

# Run all tests
docker compose up --abort-on-container-exit
```

**Step 2: Run with Environment Variables**
```bash
# Set environment variables and run
CYPRESS_BASE_URL=http://localhost:3000 docker compose up --build --abort-on-container-exit

# Run specific tests
CYPRESS_SPEC=cypress/e2e/books/**/*.cy.js docker compose up --build --abort-on-container-exit
```

**Step 3: View Logs and Debug**
```bash
# View container logs
docker compose logs cypress-tests

# Run in background
docker compose up -d

# Stop containers
docker compose down
```

#### Method 3: Local Development (without Docker)

**Step 1: Install Cypress**
```bash
# Cypress is already installed via npm install
# Verify installation
npx cypress verify
```

**Step 2: Open Cypress Test Runner**
```bash
# Opens Cypress GUI for interactive testing
npm run cy:open
```

**Step 3: Run Tests Headless**
```bash
# Run all tests locally
npm test

# Run specific test suites
npm run test:books
npm run test:authors

# Generate reports
npm run generate:report
```

## 🐳 Docker Usage

### Building and Running Tests

To build the Docker image and run all tests:

```bash
npm run docker:test
```

To run specific test suites:

```bash
npm run docker:test:books
npm run docker:test:authors
npm run docker:test:edge
```

You can also pass custom environment variables:

```bash
CYPRESS_BASE_URL="http://localhost:3000" npm run docker:test
CYPRESS_SPEC="cypress/e2e/books/*.cy.js" npm run docker:test
```

The test reports will be generated in the `cypress/reports` directory.

### Docker Environment Variables
- `CYPRESS_BASE_URL` - Base URL for the API (default: https://fakerestapi.azurewebsites.net)
- `CYPRESS_BASE_API_URL` - API endpoint URL (default: https://fakerestapi.azurewebsites.net/api/v1)
- `CYPRESS_SPEC` - Specific test files to run (optional)

### Docker Commands

```bash
# Build the image
docker compose build

# Run tests
docker compose up --abort-on-container-exit

# Run in background
docker compose up -d

# Stop containers
docker compose down

# View logs
docker compose logs cypress-tests

# Clean up
docker compose down --volumes --remove-orphans
```

## 📊 Test Coverage

### Books API Endpoints
- `GET /api/v1/Books` - Retrieve all books
- `GET /api/v1/Books/{id}` - Retrieve specific book
- `POST /api/v1/Books` - Create new book
- `PUT /api/v1/Books/{id}` - Update existing book
- `DELETE /api/v1/Books/{id}` - Delete book

### Authors API Endpoints
- `GET /api/v1/Authors` - Retrieve all authors
- `GET /api/v1/Authors/{id}` - Retrieve specific author
- `GET /api/v1/Authors/authors/books/{idBook}` - Get authors by book ID
- `POST /api/v1/Authors` - Create new author
- `PUT /api/v1/Authors/{id}` - Update existing author
- `DELETE /api/v1/Authors/{id}` - Delete author

## 🚀 CI/CD Pipeline

The simplified GitHub Actions workflow includes:

### Single Job Architecture
- **One job** that runs all tests using Docker Compose
- Automatic report generation and artifact upload
- Test result summary in GitHub Actions summary

### Triggers
- **Push/PR**: Automatic testing on main/develop branches
- **Scheduled**: Daily performance tests at 2 AM UTC
- **Manual**: On-demand execution with custom parameters

### Artifacts
- Test reports (30-day retention)
- Screenshots and videos (30-day retention)
- Performance metrics

## 📈 Reporting

### Test Output
- Tests use the built-in `spec` reporter for reliable execution
- Real-time test results displayed in console
- Screenshots and videos captured for failed tests

### Report Locations
- `cypress/screenshots/` - Failure screenshots
- `cypress/videos/` - Test execution videos
- Console output - Real-time test results

### Viewing Test Results
```bash
# Test results are displayed in console during execution
# Screenshots and videos are available in respective directories
ls cypress/screenshots/
ls cypress/videos/
```

## 🔧 Configuration

### Environment Variables
Set these in your environment or modify `docker compose.yml`:

```yaml
environment:
  - CYPRESS_BASE_URL=https://your-api-url.com
  - CYPRESS_BASE_API_URL=https://your-api-url.com/api/v1
  - CYPRESS_SPEC=cypress/e2e/books/**/*.cy.js
```

### Custom Configuration
Modify `cypress.config.js` for:
- Timeouts and retries
- Video and screenshot settings
- Reporter configuration
- Base URLs

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Check Docker version
docker --version
docker compose --version

# Note: Use 'docker compose' (without hyphen) for newer Docker versions
# If you have older Docker, you might need to install docker-compose separately

# If you get reporter errors, the project now uses built-in spec reporter
# No additional dependencies required

# Verify image build
docker images cypress-api-tests

# Check container logs
docker compose logs cypress-tests
```

#### Network Issues
```bash
# Test API connectivity
curl -f https://fakerestapi.azurewebsites.net/api/v1/Books

# Set proxy if needed
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

#### Cypress Issues
```bash
# Clear Cypress cache
npx cypress cache clear
npx cypress install

# Run with debug logs
DEBUG=cypress:* npm run docker:test
```

#### Reporter Issues
```bash
# The project now uses built-in 'spec' reporter by default
# This eliminates dependency issues and provides reliable test execution

# If you want to use a different reporter, modify cypress.config.js:
# reporter: 'spec' (default, built-in)
# reporter: 'junit' (for CI/CD integration)
# reporter: 'json' (for programmatic processing)
```

### Debug Mode
```bash
# Run single test for debugging
CYPRESS_SPEC=cypress/e2e/books/books-crud.cy.js npm run docker:test

# Run with verbose output
docker compose up --build --abort-on-container-exit --verbose
```

## 📝 Test Data Management

### Fixtures
- `books.json` - Predefined book test data
- `authors.json` - Predefined author test data

### Dynamic Data Generation
- Timestamp-based unique identifiers
- Random page counts and IDs
- Configurable data overrides

### Data Cleanup
- Automatic cleanup after test completion
- Manual cleanup commands available
- Isolation between test runs

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Mochawesome Reports](https://github.com/adamgruber/mochawesome)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)