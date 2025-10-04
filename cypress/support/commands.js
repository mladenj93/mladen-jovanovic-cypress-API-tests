// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for API testing

/**
 * Custom command to make API requests with better error handling
 */
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, options = {}) => {
  const baseUrl = Cypress.env('baseApiUrl');
  const url = `${baseUrl}${endpoint}`;
  
  const requestOptions = {
    method: method.toUpperCase(),
    url: url,
    failOnStatusCode: false,
    ...options
  };

  if (body) {
    requestOptions.body = body;
  }

  return cy.request(requestOptions);
});

/**
 * Custom command to validate response structure
 */
Cypress.Commands.add('validateResponseStructure', (response, expectedKeys) => {
  if (Array.isArray(response.body)) {
    if (response.body.length > 0) {
      expectedKeys.forEach(key => {
        expect(response.body[0]).to.have.property(key);
      });
    }
  } else {
    expectedKeys.forEach(key => {
      expect(response.body).to.have.property(key);
    });
  }
});

/**
 * Custom command to generate test data for Books
 */
Cypress.Commands.add('generateBookData', (overrides = {}) => {
  const timestamp = Date.now();
  return {
    id: 0,
    title: `Test Book ${timestamp}`,
    description: `This is a test book description created at ${new Date().toISOString()}`,
    pageCount: Math.floor(Math.random() * 500) + 100,
    excerpt: `Test excerpt for book ${timestamp}`,
    publishDate: new Date().toISOString(),
    ...overrides
  };
});

/**
 * Custom command to generate test data for Authors
 */
Cypress.Commands.add('generateAuthorData', (overrides = {}) => {
  const timestamp = Date.now();
  return {
    id: 0,
    idBook: Math.floor(Math.random() * 100) + 1,
    firstName: `TestFirstName${timestamp}`,
    lastName: `TestLastName${timestamp}`,
    ...overrides
  };
});

/**
 * Custom command to validate HTTP status codes
 */
Cypress.Commands.add('validateStatusCode', (response, expectedCode) => {
  expect(response.status).to.equal(expectedCode);
});

/**
 * Custom command to validate response time
 */
Cypress.Commands.add('validateResponseTime', (response, maxTime = 3000) => {
  expect(response.duration).to.be.lessThan(maxTime);
});

/**
 * Custom command to clean up test data
 */
Cypress.Commands.add('cleanupTestData', (resourceType, id) => {
  const endpoint = `/${resourceType}/${id}`;
  return cy.apiRequest('DELETE', endpoint);
});