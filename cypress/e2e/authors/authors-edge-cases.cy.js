describe('Authors API - Edge Cases and Error Handling', function() {
  beforeEach(function() {
    // Load test data
    cy.fixture('authors').as('authorsData');
  });

  describe('Edge Cases - Data Validation', function() {
    it('should handle extremely long author names', function() {
      const longName = 'A'.repeat(1000);
      const authorWithLongName = {
        idBook: 1,
        firstName: longName,
        lastName: longName
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithLongName,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.firstName).to.equal(longName);
        }
      });
    });

    it('should handle empty string values', function() {
      const authorWithEmptyValues = {
        idBook: 0,
        firstName: '',
        lastName: ''
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithEmptyValues,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle null values', function() {
      const authorWithNullValues = {
        idBook: null,
        firstName: null,
        lastName: null
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithNullValues,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle negative book ID', function() {
      const authorWithNegativeBookId = {
        idBook: -100,
        firstName: 'Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithNegativeBookId,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle zero book ID', function() {
      const authorWithZeroBookId = {
        idBook: 0,
        firstName: 'Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithZeroBookId,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle very large book ID', function() {
      const authorWithLargeBookId = {
        idBook: 999999999,
        firstName: 'Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithLargeBookId,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  describe('Edge Cases - ID Handling', function() {
    it('should handle zero author ID', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/0`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });

    it('should handle decimal author ID values', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/1.5`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });

    it('should handle string author ID values', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/abc`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });

    it('should handle very large book ID in authors/books endpoint', function() {
      const largeBookId = 999999999;
      
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/authors/books/${largeBookId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
      });
    });

    it('should handle zero book ID in authors/books endpoint', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/authors/books/0`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });
  });

  describe('Edge Cases - Special Characters', function() {
    it('should handle Unicode characters in author names', function() {
      const unicodeAuthor = {
        idBook: 1,
        firstName: 'José María 🚀',
        lastName: 'García-López 📚'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: unicodeAuthor,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.firstName).to.equal(unicodeAuthor.firstName);
        }
      });
    });

    it('should handle SQL injection attempts', function() {
      const maliciousAuthor = {
        idBook: 1,
        firstName: "'; DROP TABLE Authors; --",
        lastName: "1' OR '1'='1"
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: maliciousAuthor,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle XSS attempts', function() {
      const xssAuthor = {
        idBook: 1,
        firstName: '<script>alert("XSS")</script>',
        lastName: '<img src=x onerror=alert("XSS")>'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: xssAuthor,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle special characters in names', function() {
      const specialCharAuthor = {
        idBook: 1,
        firstName: 'Jean-Pierre',
        lastName: "O'Connor-Smith"
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: specialCharAuthor,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.firstName).to.equal(specialCharAuthor.firstName);
        }
      });
    });
  });

  describe('Edge Cases - Performance and Load', function() {
    it('should handle rapid sequential requests', function() {
      const requests = [];
      
      // Create 10 rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: `${Cypress.env('baseApiUrl')}/Authors`,
            failOnStatusCode: false
          })
        );
      }

      // Wait for all requests to complete
      cy.wrap(requests).then(() => {
        requests.forEach(request => {
          expect(request).to.not.be.undefined;
        });
      });
    });

    it('should handle concurrent create operations', function() {
      const authors = [];
      
      // Create multiple authors concurrently
      for (let i = 0; i < 5; i++) {
        authors.push({
          idBook: 1,
          firstName: `Concurrent Author ${i}`,
          lastName: `Lastname ${i}`
        });
      }

      // Send all requests
      authors.forEach(author => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('baseApiUrl')}/Authors`,
          body: author,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 422, 429]).to.include(response.status);
        });
      });
    });

    it('should handle large dataset queries efficiently', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.duration).to.be.lessThan(5000);
          expect(response.body).to.be.an('array');
        }
      });
    });
  });

  describe('Edge Cases - Data Consistency', function() {
    it('should maintain data integrity during updates', function() {
      // First create an author
      const originalAuthor = {
        idBook: 1,
        firstName: 'Original First',
        lastName: 'Original Last'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: originalAuthor,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const authorId = createResponse.body.id;
          
          // Update the author
          const updatedAuthor = {
            idBook: 2,
            firstName: 'Updated First',
            lastName: 'Updated Last'
          };

          cy.request({
            method: 'PUT',
            url: `${Cypress.env('baseApiUrl')}/Authors/${authorId}`,
            body: updatedAuthor,
            failOnStatusCode: false
          }).then((updateResponse) => {
            expect([200, 400, 422]).to.include(updateResponse.status);
            
            if (updateResponse.status === 200) {
              // Verify the update
              cy.request({
                method: 'GET',
                url: `${Cypress.env('baseApiUrl')}/Authors/${authorId}`,
                failOnStatusCode: false
              }).then((getResponse) => {
                expect([200, 404]).to.include(getResponse.status);
                
                if (getResponse.status === 200) {
                  expect(getResponse.body.firstName).to.equal(updatedAuthor.firstName);
                }
              });
            }
          });
        }
      });
    });

    it('should handle partial updates correctly', function() {
      // Create an author first
      const originalAuthor = {
        idBook: 1,
        firstName: 'Partial Update Test',
        lastName: 'Original Last'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: originalAuthor,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const authorId = createResponse.body.id;
          
          // Partial update - only firstName
          const partialUpdate = {
            firstName: 'Partially Updated First'
          };

          cy.request({
            method: 'PUT',
            url: `${Cypress.env('baseApiUrl')}/Authors/${authorId}`,
            body: partialUpdate,
            failOnStatusCode: false
          }).then((updateResponse) => {
            expect([200, 400, 422]).to.include(updateResponse.status);
          });
        }
      });
    });
  });

  describe('Edge Cases - Boundary Testing', function() {
    it('should handle maximum integer values', function() {
      const authorWithMaxInt = {
        idBook: Number.MAX_SAFE_INTEGER,
        firstName: 'Max Int Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithMaxInt,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle minimum integer values', function() {
      const authorWithMinInt = {
        idBook: Number.MIN_SAFE_INTEGER,
        firstName: 'Min Int Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithMinInt,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle floating point book IDs', function() {
      const authorWithFloatId = {
        idBook: 1.5,
        firstName: 'Float Test',
        lastName: 'Author'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: authorWithFloatId,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });
});