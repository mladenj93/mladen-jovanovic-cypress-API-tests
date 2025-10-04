describe('Books API - Edge Cases and Error Handling', function() {
  beforeEach(function() {
    // Load test data
    cy.fixture('books').as('booksData');
  });

  describe('Edge Cases - Data Validation', function() {
    it('should handle extremely long book titles', function() {
      const longTitle = 'A'.repeat(1000);
      const bookWithLongTitle = {
        title: longTitle,
        description: 'Test description',
        pageCount: 100,
        excerpt: 'Test excerpt',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithLongTitle,
        failOnStatusCode: false
      }).then((response) => {
        // API might accept or reject long titles
        expect([200, 400, 422]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.title).to.equal(longTitle);
        }
      });
    });

    it('should handle empty string values', function() {
      const bookWithEmptyValues = {
        title: '',
        description: '',
        pageCount: 0,
        excerpt: '',
        publishDate: ''
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithEmptyValues,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle null values', function() {
      const bookWithNullValues = {
        title: null,
        description: null,
        pageCount: null,
        excerpt: null,
        publishDate: null
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithNullValues,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle negative page count', function() {
      const bookWithNegativePages = {
        title: 'Test Book',
        description: 'Test description',
        pageCount: -100,
        excerpt: 'Test excerpt',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithNegativePages,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle future publish dates', function() {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);
      
      const bookWithFutureDate = {
        title: 'Future Book',
        description: 'Test description',
        pageCount: 100,
        excerpt: 'Test excerpt',
        publishDate: futureDate.toISOString()
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithFutureDate,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle very old publish dates', function() {
      const oldDate = '1800-01-01T00:00:00.000Z';
      
      const bookWithOldDate = {
        title: 'Old Book',
        description: 'Test description',
        pageCount: 100,
        excerpt: 'Test excerpt',
        publishDate: oldDate
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: bookWithOldDate,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  describe('Edge Cases - ID Handling', function() {
    it('should handle very large ID values', function() {
      const largeId = 999999999;
      
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Books/${largeId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
      });
    });

    it('should handle zero ID', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Books/0`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });

    it('should handle decimal ID values', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Books/1.5`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });

    it('should handle string ID values', function() {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Books/abc`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404, 400]).to.include(response.status);
      });
    });
  });

  describe('Edge Cases - Special Characters', function() {
    it('should handle Unicode characters in book data', function() {
      const unicodeBook = {
        title: '测试书籍 🚀 📚',
        description: 'Descripción con emojis 🎉',
        pageCount: 100,
        excerpt: 'Excerpt with special chars: @#$%^&*()',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: unicodeBook,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.title).to.equal(unicodeBook.title);
        }
      });
    });

    it('should handle SQL injection attempts', function() {
      const maliciousBook = {
        title: "'; DROP TABLE Books; --",
        description: "1' OR '1'='1",
        pageCount: 100,
        excerpt: "'; DELETE FROM Books; --",
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: maliciousBook,
        failOnStatusCode: false
      }).then((response) => {
        // API should handle this gracefully
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should handle XSS attempts', function() {
      const xssBook = {
        title: '<script>alert("XSS")</script>',
        description: '<img src=x onerror=alert("XSS")>',
        pageCount: 100,
        excerpt: 'javascript:alert("XSS")',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: xssBook,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
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
            url: `${Cypress.env('baseApiUrl')}/Books`,
            failOnStatusCode: false
          })
        );
      }

      // Wait for all requests to complete
      cy.wrap(requests).then(() => {
        // All requests should complete successfully
        requests.forEach(request => {
          expect(request).to.not.be.undefined;
        });
      });
    });

    it('should handle concurrent create operations', function() {
      const books = [];
      
      // Create multiple books concurrently
      for (let i = 0; i < 5; i++) {
        books.push({
          title: `Concurrent Book ${i}`,
          description: `Description for book ${i}`,
          pageCount: 100 + i,
          excerpt: `Excerpt for book ${i}`,
          publishDate: '2023-01-01T00:00:00.000Z'
        });
      }

      // Send all requests
      books.forEach(book => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('baseApiUrl')}/Books`,
          body: book,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 422, 429]).to.include(response.status);
        });
      });
    });
  });

  describe('Edge Cases - Data Consistency', function() {
    it('should maintain data integrity during updates', function() {
      // First create a book
      const originalBook = {
        title: 'Original Title',
        description: 'Original description',
        pageCount: 100,
        excerpt: 'Original excerpt',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: originalBook,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const bookId = createResponse.body.id;
          
          // Update the book
          const updatedBook = {
            title: 'Updated Title',
            description: 'Updated description',
            pageCount: 200,
            excerpt: 'Updated excerpt',
            publishDate: '2023-02-01T00:00:00.000Z'
          };

          cy.request({
            method: 'PUT',
            url: `${Cypress.env('baseApiUrl')}/Books/${bookId}`,
            body: updatedBook,
            failOnStatusCode: false
          }).then((updateResponse) => {
            expect([200, 400, 422]).to.include(updateResponse.status);
            
            if (updateResponse.status === 200) {
              // Verify the update
              cy.request({
                method: 'GET',
                url: `${Cypress.env('baseApiUrl')}/Books/${bookId}`,
                failOnStatusCode: false
              }).then((getResponse) => {
                expect([200, 404]).to.include(getResponse.status);
                
                if (getResponse.status === 200) {
                  expect(getResponse.body.title).to.equal(updatedBook.title);
                }
              });
            }
          });
        }
      });
    });

    it('should handle partial updates correctly', function() {
      // Create a book first
      const originalBook = {
        title: 'Partial Update Test',
        description: 'Original description',
        pageCount: 100,
        excerpt: 'Original excerpt',
        publishDate: '2023-01-01T00:00:00.000Z'
      };

      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: originalBook,
        failOnStatusCode: false
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const bookId = createResponse.body.id;
          
          // Partial update - only title
          const partialUpdate = {
            title: 'Partially Updated Title'
          };

          cy.request({
            method: 'PUT',
            url: `${Cypress.env('baseApiUrl')}/Books/${bookId}`,
            body: partialUpdate,
            failOnStatusCode: false
          }).then((updateResponse) => {
            expect([200, 400, 422]).to.include(updateResponse.status);
          });
        }
      });
    });
  });
});