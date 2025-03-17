// Book class to create book objects
class Book {
    constructor(id, title, author, category) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.status = 'available';
        this.borrowedBy = null;
        this.borrowDate = null;
        this.returnDate = null;
        this.coverUrl = this.getBookCover(id); // Use book ID to get unique cover
    }

    getBookCover(bookId) {
        // Unique cover images for each book
        const covers = {
            1: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19', // The Great Gatsby
            2: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73', // 1984
            3: 'https://images.unsplash.com/photo-1544931170-3ca1337cce88', // To Kill a Mockingbird
            4: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', // Pride and Prejudice
            5: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', // Think and Grow Rich
            6: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19', // The 7 Habits of Highly Effective People
            7: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d', // Atomic Habits
            8: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744', // Sapiens
            9: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', // A Brief History of Time
            10: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', // Cosmos
            11: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73', // The Selfish Gene
            12: 'https://images.unsplash.com/photo-1544931170-3ca1337cce88', // The Double Helix
            13: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19', // The World War II
            14: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', // Guns, Germs, and Steel
            15: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', // The Rise and Fall of the Third Reich
            16: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744' // A People's History of the United States
        };
        return covers[bookId] || covers[1]; // Default to the first cover if not found
    }
}

// Library class to manage the book collection
class Library {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('books')) || [];
        this.history = JSON.parse(localStorage.getItem('history')) || [];
        this.init();
    }

    init() {
        // Add event listeners
        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        // Add input event listener for the search bar
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterBooks();
        });

        // Add change event listener for the category filter
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterBooks();
        });

        // Initial render
        this.renderBooks();
        this.renderHistory();
    }

    addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const category = document.getElementById('category').value;
        
        const book = new Book(Date.now(), title, author, category);
        this.books.push(book);
        this.saveToLocalStorage();
        this.renderBooks();
        
        // Reset form
        document.getElementById('addBookForm').reset();
    }

    borrowBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (book && book.status === 'available') {
            book.status = 'borrowed';
            book.borrowDate = new Date().toISOString();
            book.borrowedBy = 'User'; // In a real app, this would be the logged-in user

            this.history.push({
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                action: 'borrowed',
                date: book.borrowDate
            });

            this.saveToLocalStorage();
            this.renderBooks();
            this.renderHistory();
        }
    }

    returnBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (book && book.status === 'borrowed') {
            book.status = 'available';
            book.returnDate = new Date().toISOString();
            book.borrowedBy = null;

            this.history.push({
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                action: 'returned',
                date: book.returnDate
            });

            this.saveToLocalStorage();
            this.renderBooks();
            this.renderHistory();
        }
    }

    filterBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        const filteredBooks = this.books.filter(book => {
            const matchesSearch = searchTerm === '' || 
                                 book.title.toLowerCase().includes(searchTerm) ||
                                 book.author.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        this.renderBooks(filteredBooks);
    }

    renderBooks(booksToRender = this.books) {
        const booksGrid = document.getElementById('booksGrid');
        booksGrid.innerHTML = ''; // Clear the current grid

        booksToRender.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${book.coverUrl}" alt="${book.title}" class="book-cover">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Category:</strong> ${book.category}</p>
                    <p class="status-${book.status}"><strong>Status:</strong> ${book.status}</p>
                    <div class="book-actions">
                        ${book.status === 'available' 
                            ? `<button onclick="library.borrowBook(${book.id})">Borrow</button>`
                            : `<button onclick="library.returnBook(${book.id})">Return</button>`
                        }
                    </div>
                </div>
            `;
            booksGrid.appendChild(bookCard);
        });
    }

    renderHistory() {
        const historyList = document.querySelector('.history-list');
        historyList.innerHTML = '';

        this.history.slice().reverse().forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <p>${record.bookTitle} was ${record.action} on ${new Date(record.date).toLocaleDateString()}</p>
            `;
            historyList.appendChild(historyItem);
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('books', JSON.stringify(this.books));
        localStorage.setItem('history', JSON.stringify(this.history));
    }
}

// Initialize library and make it globally available
window.library = new Library();

// Add 16 sample books (4 per category) if the library is empty
if (window.library.books.length === 0) {
    const sampleBooks = [
        // Fiction
        new Book(1, "The Great Gatsby", "F. Scott Fitzgerald", "fiction"),
        new Book(2, "1984", "George Orwell", "fiction"),
        new Book(3, "To Kill a Mockingbird", "Harper Lee", "fiction"),
        new Book(4, "Pride and Prejudice", "Jane Austen", "fiction"),

        // Non-Fiction
        new Book(5, "Think and Grow Rich", "Napoleon Hill", "non-fiction"),
        new Book(6, "The 7 Habits of Highly Effective People", "Stephen R. Covey", "non-fiction"),
        new Book(7, "Atomic Habits", "James Clear", "non-fiction"),
        new Book(8, "Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "non-fiction"),

        // Science
        new Book(9, "A Brief History of Time", "Stephen Hawking", "science"),
        new Book(10, "Cosmos", "Carl Sagan", "science"),
        new Book(11, "The Selfish Gene", "Richard Dawkins", "science"),
        new Book(12, "The Double Helix", "James D. Watson", "science"),

        // History
        new Book(13, "The World War II", "Winston Churchill", "history"),
        new Book(14, "Guns, Germs, and Steel", "Jared Diamond", "history"),
        new Book(15, "The Rise and Fall of the Third Reich", "William L. Shirer", "history"),
        new Book(16, "A People's History of the United States", "Howard Zinn", "history")
    ];
    sampleBooks.forEach(book => window.library.books.push(book));
    window.library.saveToLocalStorage();
    window.library.renderBooks();
}