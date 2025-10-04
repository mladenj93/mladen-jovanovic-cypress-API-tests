const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://fakerestapi.azurewebsites.net',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    retries: {
      runMode: 1,
      openMode: 0
    },
    reporter: 'spec',
    env: {
      apiVersion: 'v1',
      baseApiUrl: 'https://fakerestapi.azurewebsites.net/api/v1'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      // Clear reports before each run
      on('before:run', () => {
        console.log('Starting test execution...');
      });

      on('after:run', (results) => {
        console.log('Test execution completed.');
      });
    }
  }
});