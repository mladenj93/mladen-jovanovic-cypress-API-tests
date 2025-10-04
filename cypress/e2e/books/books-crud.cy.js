// BooksAPI is available globally from api-helpers.js

describe('Books API - CRUD Operations', () => {
  let booksAPI;
  let testBookId;

  before(() => {
    booksAPI = new BooksAPI();
  });

  beforeEach(() => {
    // Load test data
    cy.fixture('books').as('booksData');
  });

  describe('GET /api/v1/Books - Retrieve All Books', () => {
    it('should retrieve all books successfully', function() {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Books`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(3000);
        
        expect(response.body).to.be.an('array');
        expect(response.headers['content-type']).to.include('application/json');
        
        if (response.body.length > 0) {
          booksAPI.validateBookStructure(response.body[0]);
          booksAPI.validateBookDataTypes(response.body[0]);
        }
      });
    });

    it('should return consistent data structure across multiple calls', () => {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Books`).then((firstResponse) => {
        expect(firstResponse.status).to.equal(200);
        
        cy.request('GET', `${Cypress.env('baseApiUrl')}/Books`).then((secondResponse) => {
          expect(secondResponse.status).to.equal(200);
          expect(secondResponse.body.length).to.equal(firstResponse.body.length);
        });
      });
    });

    it('should handle large dataset efficiently', () => {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Books`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(5000); // Allow more time for large datasets
        
        // Verify pagination or data structure for large responses
        expect(response.body.length).to.be.greaterThan(0);
      });
    });
  });

  describe('GET /api/v1/Books/{id} - Retrieve Specific Book', () => {
    it('should retrieve a specific book by valid ID', () => {
      // First get all books to find a valid ID
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Books`).then((response) => {
        if (response.body.length > 0) {
          const validId = response.body[0].id;
          
          cy.request('GET', `${Cypress.env('baseApiUrl')}/Books/${validId}`).then((bookResponse) => {
            expect(bookResponse.status).to.equal(200);
            cy.validateResponseTime(bookResponse);
            
            booksAPI.validateBookStructure(bookResponse.body);
            booksAPI.validateBookDataTypes(bookResponse.body);
            expect(bookResponse.body.id).to.equal(validId);
          });
        }
      });
    });

    it('should handle non-existent book ID gracefully', () => {
      const nonExistentId = 999999;
      
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Books/${nonExistentId}`,
        failOnStatusCode: false
      }).then((response) => {
        // API might return 404 or 200 with null/empty data
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          // Check if response indicates no data found
          expect(response.body).to.satisfy((body) => 
            body === null || body === '' || Object.keys(body).length === 0
          );
        }
      });
    });

  });

  describe('POST /api/v1/Books - Create New Book', () => {
    it('should create a new book with valid data', function() {
      const newBook = this.booksData.validBook;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, newBook).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(3000);
        
        // Store created book ID for cleanup
        if (response.body && response.body.id) {
          testBookId = response.body.id;
        }
        
        // Verify response structure matches request
        expect(response.body.title).to.equal(newBook.title);
        expect(response.body.description).to.equal(newBook.description);
        expect(response.body.pageCount).to.equal(newBook.pageCount);
      });
    });


    it('should handle book creation with long text fields', function() {
      const longTextBook = this.booksData.bookWithLongText;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, longTextBook).then((response) => {
        expect(response.status).to.equal(200);
        
        expect(response.body.title).to.equal(longTextBook.title);
        expect(response.body.description).to.equal(longTextBook.description);
      });
    });

    it('should handle invalid book data', function() {
      const invalidBook = this.booksData.invalidBook;
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Books`,
        body: invalidBook,
        failOnStatusCode: false
      }).then((response) => {
        // API might accept invalid data or return validation error
        // This tests the API's validation behavior
        expect(response.status).to.be.oneOf([200, 400, 422]);
      });
    });

    it('should create multiple books sequentially', function() {
      const book1 = { ...this.booksData.validBook, title: 'Sequential Book 1' };
      const book2 = { ...this.booksData.validBook, title: 'Sequential Book 2' };
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, book1).then((response1) => {
        expect(response1.status).to.equal(200);
        
        cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, book2).then((response2) => {
          expect(response2.status).to.equal(200);
          
          expect(response2.body.title).to.equal(book2.title);
          expect(response1.body.title).to.not.equal(response2.body.title);
        });
      });
    });
  });

  describe('PUT /api/v1/Books/{id} - Update Existing Book', () => {
    it('should update an existing book successfully', function() {
      // First create a book to update
      const originalBook = this.booksData.validBook;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, originalBook).then((createResponse) => {
        expect(createResponse.status).to.equal(200);
        
        const bookId = createResponse.body.id;
        const updatedData = {
          ...this.booksData.bookToUpdate,
          id: bookId
        };
        
        cy.request('PUT', `${Cypress.env('baseApiUrl')}/Books/${bookId}`, updatedData).then((updateResponse) => {
          expect(updateResponse.status).to.equal(200);
          cy.validateResponseTime(updateResponse);
          
          expect(updateResponse.body.id).to.equal(bookId);
          expect(updateResponse.body.title).to.equal(updatedData.title);
          expect(updateResponse.body.description).to.equal(updatedData.description);
        });
      });
    });

    it('should handle partial updates', function() {
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, this.booksData.validBook).then((createResponse) => {
        const bookId = createResponse.body.id;
        const partialUpdate = {
          id: bookId,
          title: 'Partially Updated Title',
          // Only updating title, keeping other fields
          description: createResponse.body.description,
          pageCount: createResponse.body.pageCount,
          excerpt: createResponse.body.excerpt,
          publishDate: createResponse.body.publishDate
        };
        
        cy.request('PUT', `${Cypress.env('baseApiUrl')}/Books/${bookId}`, partialUpdate).then((updateResponse) => {
          expect(updateResponse.status).to.equal(200);
          
          expect(updateResponse.body.title).to.equal(partialUpdate.title);
          expect(updateResponse.body.description).to.equal(createResponse.body.description);
        });
      });
    });
  });

  describe('DELETE /api/v1/Books/{id} - Delete Book', () => {
    it('should delete an existing book successfully', function() {
      // First create a book to delete
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Books`, this.booksData.validBook).then((createResponse) => {
        expect(createResponse.status).to.equal(200);
        
        const bookId = createResponse.body.id;
        
        cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Books/${bookId}`).then((deleteResponse) => {
          expect(deleteResponse.status).to.equal(200);
          cy.validateResponseTime(deleteResponse);
          
          // Verify book is deleted by trying to retrieve it
          cy.request({
            method: 'GET',
            url: `${Cypress.env('baseApiUrl')}/Books/${bookId}`,
            failOnStatusCode: false
          }).then((getResponse) => {
            expect([404, 200]).to.include(getResponse.status);
            
            if (getResponse.status === 200) {
              // If status is 200, body should be empty or null
              expect(getResponse.body).to.satisfy((body) => 
                body === null || body === '' || Object.keys(body).length === 0
              );
            }
          });
        });
      });
    });

    it('should handle deleting non-existent book', () => {
      const nonExistentId = 999999;
      
      cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Books/${nonExistentId}`).then((response) => {
        // API should handle gracefully
        expect([200, 404]).to.include(response.status);
      });
    });

  });

  // Cleanup after all tests
  after(() => {
    if (testBookId) {
      cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Books/${testBookId}`);
    }
  });
});