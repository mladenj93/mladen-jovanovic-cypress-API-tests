// AuthorsAPI is available globally from api-helpers.js

describe('Authors API - CRUD Operations', () => {
  let authorsAPI;
  let testAuthorId;

  before(() => {
    authorsAPI = new AuthorsAPI();
  });

  beforeEach(() => {
    cy.fixture('authors').as('authorsData');
  });

  describe('GET /api/v1/Authors - Retrieve All Authors', () => {
    it('should retrieve all authors successfully', function() {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(3000);
        
        expect(response.body).to.be.an('array');
        expect(response.headers['content-type']).to.include('application/json');
        
        if (response.body.length > 0) {
          authorsAPI.validateAuthorStructure(response.body[0]);
          authorsAPI.validateAuthorDataTypes(response.body[0]);
        }
      });
    });

    it('should handle performance for large author datasets', () => {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(5000);
        
        expect(response.body.length).to.be.greaterThan(0);
      });
    });
  });

  describe('GET /api/v1/Authors/{id} - Retrieve Specific Author', () => {
    it('should retrieve a specific author by valid ID', () => {
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors`).then((response) => {
        if (response.body.length > 0) {
          const validId = response.body[0].id;
          
          cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors/${validId}`).then((authorResponse) => {
            expect(authorResponse.status).to.equal(200);
            cy.validateResponseTime(authorResponse);
            
            authorsAPI.validateAuthorStructure(authorResponse.body);
            authorsAPI.validateAuthorDataTypes(authorResponse.body);
            expect(authorResponse.body.id).to.equal(validId);
          });
        }
      });
    });

    it('should handle non-existent author ID', () => {
      const nonExistentId = 999999;
      
      cy.request({
        method: 'GET',
        url: `${Cypress.env('baseApiUrl')}/Authors/${nonExistentId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body).to.satisfy((body) => 
            body === null || body === '' || Object.keys(body).length === 0
          );
        }
      });
    });

  });

  describe('GET /api/v1/Authors/authors/books/{idBook} - Get Authors by Book ID', () => {
    it('should retrieve authors for a specific book', () => {
      // First get all authors to find a valid book ID
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors`).then((response) => {
        if (response.body.length > 0) {
          const bookId = response.body[0].idBook;
          
          cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors/authors/books/${bookId}`).then((bookAuthorsResponse) => {
            expect(bookAuthorsResponse.status).to.equal(200);
            cy.validateResponseTime(bookAuthorsResponse);
            
            expect(bookAuthorsResponse.body).to.be.an('array');
            
            if (bookAuthorsResponse.body.length > 0) {
              bookAuthorsResponse.body.forEach(author => {
                authorsAPI.validateAuthorStructure(author);
                expect(author.idBook).to.equal(bookId);
              });
            }
          });
        }
      });
    });

    it('should handle non-existent book ID', () => {
      const nonExistentBookId = 999999;
      
      cy.request('GET', `${Cypress.env('baseApiUrl')}/Authors/authors/books/${nonExistentBookId}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.equal(0);
      });
    });

    it('should handle invalid book ID formats', () => {
      const invalidBookIds = ['abc', '!@#', ''];
      
      invalidBookIds.forEach(invalidId => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('baseApiUrl')}/Authors/authors/books/${invalidId}`,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 404]).to.include(response.status);
        });
      });
    });
  });

  describe('POST /api/v1/Authors - Create New Author', () => {
    it('should create a new author with valid data', function() {
      const newAuthor = this.authorsData.validAuthor;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, newAuthor).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.duration).to.be.lessThan(3000);
        
        if (response.body && response.body.id) {
          testAuthorId = response.body.id;
        }
        
        expect(response.body.firstName).to.equal(newAuthor.firstName);
        expect(response.body.lastName).to.equal(newAuthor.lastName);
        expect(response.body.idBook).to.equal(newAuthor.idBook);
      });
    });



    it('should handle author creation with long names', function() {
      const longNameAuthor = this.authorsData.authorWithLongNames;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, longNameAuthor).then((response) => {
        expect(response.status).to.equal(200);
        
        expect(response.body.firstName).to.equal(longNameAuthor.firstName);
        expect(response.body.lastName).to.equal(longNameAuthor.lastName);
      });
    });

    it('should handle invalid author data', function() {
      const invalidAuthor = this.authorsData.invalidAuthor;
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('baseApiUrl')}/Authors`,
        body: invalidAuthor,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });

    it('should create multiple authors for the same book', function() {
      const bookId = 1;
      const author1 = {
        ...this.authorsData.validAuthor,
        idBook: bookId,
        firstName: 'Author1',
        lastName: 'CoAuthor'
      };
      const author2 = {
        ...this.authorsData.validAuthor,
        idBook: bookId,
        firstName: 'Author2',
        lastName: 'CoAuthor'
      };
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, author1).then((response1) => {
        expect(response1.status).to.equal(200);
        
        cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, author2).then((response2) => {
          expect(response2.status).to.equal(200);
          
          expect(response1.body.idBook).to.equal(response2.body.idBook);
          expect(response1.body.firstName).to.not.equal(response2.body.firstName);
        });
      });
    });
  });

  describe('PUT /api/v1/Authors/{id} - Update Existing Author', () => {
    it('should update an existing author successfully', function() {
      const originalAuthor = this.authorsData.validAuthor;
      
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, originalAuthor).then((createResponse) => {
        expect(createResponse.status).to.equal(200);
        
        const authorId = createResponse.body.id;
        const updatedData = {
          ...this.authorsData.authorToUpdate,
          id: authorId
        };
        
        cy.request('PUT', `${Cypress.env('baseApiUrl')}/Authors/${authorId}`, updatedData).then((updateResponse) => {
          expect(updateResponse.status).to.equal(200);
          cy.validateResponseTime(updateResponse);
          
          expect(updateResponse.body.id).to.equal(authorId);
          expect(updateResponse.body.firstName).to.equal(updatedData.firstName);
          expect(updateResponse.body.lastName).to.equal(updatedData.lastName);
        });
      });
    });

    it('should handle partial author updates', function() {
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, this.authorsData.validAuthor).then((createResponse) => {
        const authorId = createResponse.body.id;
        const partialUpdate = {
          id: authorId,
          firstName: 'Updated First Name',
          lastName: createResponse.body.lastName,
          idBook: createResponse.body.idBook
        };
        
        cy.request('PUT', `${Cypress.env('baseApiUrl')}/Authors/${authorId}`, partialUpdate).then((updateResponse) => {
          expect(updateResponse.status).to.equal(200);
          
          expect(updateResponse.body.firstName).to.equal(partialUpdate.firstName);
          expect(updateResponse.body.lastName).to.equal(createResponse.body.lastName);
        });
      });
    });

    it('should handle updating author with invalid data', function() {
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, this.authorsData.validAuthor).then((createResponse) => {
        const authorId = createResponse.body.id;
        const invalidUpdate = {
          id: authorId,
          firstName: null,
          lastName: '',
          idBook: -1
        };
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('baseApiUrl')}/Authors/${authorId}`,
          body: invalidUpdate,
          failOnStatusCode: false
        }).then((updateResponse) => {
          expect([200, 400, 422]).to.include(updateResponse.status);
        });
      });
    });
  });

  describe('DELETE /api/v1/Authors/{id} - Delete Author', () => {
    it('should delete an existing author successfully', function() {
      cy.request('POST', `${Cypress.env('baseApiUrl')}/Authors`, this.authorsData.validAuthor).then((createResponse) => {
        expect(createResponse.status).to.equal(200);
        
        const authorId = createResponse.body.id;
        
        cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Authors/${authorId}`).then((deleteResponse) => {
          expect(deleteResponse.status).to.equal(200);
          cy.validateResponseTime(deleteResponse);
          
          // Verify author is deleted
          cy.request({
            method: 'GET',
            url: `${Cypress.env('baseApiUrl')}/Authors/${authorId}`,
            failOnStatusCode: false
          }).then((getResponse) => {
            expect([404, 200]).to.include(getResponse.status);
            
            if (getResponse.status === 200) {
              expect(getResponse.body).to.satisfy((body) => 
                body === null || body === '' || Object.keys(body).length === 0
              );
            }
          });
        });
      });
    });

    it('should handle deleting non-existent author', () => {
      const nonExistentId = 999999;
      
      cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Authors/${nonExistentId}`).then((response) => {
        expect([200, 404]).to.include(response.status);
      });
    });

    it('should handle invalid ID in delete request', () => {
      const invalidId = 'invalid-id';
      
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('baseApiUrl')}/Authors/${invalidId}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 404]).to.include(response.status);
      });
    });
  });

  // Cleanup
  after(() => {
    if (testAuthorId) {
      cy.request('DELETE', `${Cypress.env('baseApiUrl')}/Authors/${testAuthorId}`);
    }
  });
});