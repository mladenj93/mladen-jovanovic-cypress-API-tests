/**
 * API Helper classes for Books and Authors endpoints
 * Provides reusable methods for API operations
 */

class BooksAPI {
  constructor() {
    this.endpoint = '/Books';
  }

  /**
   * Get all books
   */
  getAllBooks() {
    return cy.apiRequest('GET', this.endpoint);
  }

  /**
   * Get book by ID
   * @param {number} id - Book ID
   */
  getBookById(id) {
    return cy.apiRequest('GET', `${this.endpoint}/${id}`);
  }

  /**
   * Create a new book
   * @param {object} bookData - Book data
   */
  createBook(bookData) {
    return cy.apiRequest('POST', this.endpoint, bookData);
  }

  /**
   * Update an existing book
   * @param {number} id - Book ID
   * @param {object} bookData - Updated book data
   */
  updateBook(id, bookData) {
    const updatedData = { ...bookData, id: id };
    return cy.apiRequest('PUT', `${this.endpoint}/${id}`, updatedData);
  }

  /**
   * Delete a book
   * @param {number} id - Book ID
   */
  deleteBook(id) {
    return cy.apiRequest('DELETE', `${this.endpoint}/${id}`);
  }

  /**
   * Validate book structure
   * @param {object} book - Book object to validate
   */
  validateBookStructure(book) {
    const expectedKeys = ['id', 'title', 'description', 'pageCount', 'excerpt', 'publishDate'];
    expectedKeys.forEach(key => {
      expect(book).to.have.property(key);
    });
  }

  /**
   * Validate book data types
   * @param {object} book - Book object to validate
   */
  validateBookDataTypes(book) {
    expect(book.id).to.be.a('number');
    expect(book.title).to.be.a('string');
    expect(book.description).to.be.a('string');
    expect(book.pageCount).to.be.a('number');
    expect(book.excerpt).to.be.a('string');
    expect(book.publishDate).to.be.a('string');
  }
}

class AuthorsAPI {
  constructor() {
    this.endpoint = '/Authors';
  }

  /**
   * Get all authors
   */
  getAllAuthors() {
    return cy.apiRequest('GET', this.endpoint);
  }

  /**
   * Get author by ID
   * @param {number} id - Author ID
   */
  getAuthorById(id) {
    return cy.apiRequest('GET', `${this.endpoint}/${id}`);
  }

  /**
   * Get authors by book ID
   * @param {number} bookId - Book ID
   */
  getAuthorsByBookId(bookId) {
    return cy.apiRequest('GET', `${this.endpoint}/authors/books/${bookId}`);
  }

  /**
   * Create a new author
   * @param {object} authorData - Author data
   */
  createAuthor(authorData) {
    return cy.apiRequest('POST', this.endpoint, authorData);
  }

  /**
   * Update an existing author
   * @param {number} id - Author ID
   * @param {object} authorData - Updated author data
   */
  updateAuthor(id, authorData) {
    const updatedData = { ...authorData, id: id };
    return cy.apiRequest('PUT', `${this.endpoint}/${id}`, updatedData);
  }

  /**
   * Delete an author
   * @param {number} id - Author ID
   */
  deleteAuthor(id) {
    return cy.apiRequest('DELETE', `${this.endpoint}/${id}`);
  }

  /**
   * Validate author structure
   * @param {object} author - Author object to validate
   */
  validateAuthorStructure(author) {
    const expectedKeys = ['id', 'idBook', 'firstName', 'lastName'];
    expectedKeys.forEach(key => {
      expect(author).to.have.property(key);
    });
  }

  /**
   * Validate author data types
   * @param {object} author - Author object to validate
   */
  validateAuthorDataTypes(author) {
    expect(author.id).to.be.a('number');
    expect(author.idBook).to.be.a('number');
    expect(author.firstName).to.be.a('string');
    expect(author.lastName).to.be.a('string');
  }
}

// Export helper classes for Cypress
// Make classes available globally for Cypress tests
window.BooksAPI = BooksAPI;
window.AuthorsAPI = AuthorsAPI;