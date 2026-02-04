# BookHome 📚

BookHome is a comprehensive web application built with HTML, CSS, and JavaScript that combines an online bookstore with a digital reading platform. It serves as a practical example of a modern, responsive web application with dynamic content management.

**Author:** Abhishek Choudhary

## 🚀 Project Workflow

1.  **Discovery**: Users land on the **Home** page to view featured and top-rated books.
2.  **Browsing**: The **Services** page offers a full catalog with filtering options for "Selling Books" and "Free Reading".
3.  **Interaction**:
    - **Free Books**: Users can immediately start reading via the built-in **Reader** interface without an account.
    - **Paid Books**: Users add books to the **Cart**.
4.  **Authentication**: Users **Sign Up** or **Login** to manage their profile, save order history, and complete purchases.
5.  **Checkout**: Secure checkout process with address validation and simulated payment gateways (UPI/Card/COD).
6.  **Post-Purchase**: Orders are saved to the **User Profile**, and stock is automatically updated.
7.  **Administration**: Admins can log in to a dedicated dashboard to **Add**, **Edit**, or **Delete** books from the inventory.
8.  **Communication**: Users can send messages via the Contact page, which opens their email client and saves the record to their profile.

## 🌟 Why Choose BookHome?

Unlike standard e-commerce templates, BookHome offers unique features:

- **Hybrid Platform**: Seamlessly integrates an e-commerce store with a functional e-book reader.
- **Zero-Friction Reading**: No registration required to access the free library.
- **Dynamic Stock Management**: Real-time inventory tracking that prevents ordering out-of-stock items and supports "Notify Me" functionality.
- **Dual-Mode Data Handling**: Built to work with a Node.js backend (`server.js`) but gracefully falls back to `localStorage` for a full offline/serverless demo experience.
- **Admin CMS**: A complete Content Management System included out-of-the-box.

## 🏗️ Component Architecture

### Frontend

- **`index.html`**: The landing page featuring dynamic sliders and search functionality.
- **`services.html`**: The main catalog using grid layouts and JavaScript-based category filtering.
- **`reader.html`**: A specialized reading interface that parses HTML book content into paginated views.
- **`contact.html`**: A contact form that integrates with the user's email client and profile history.
- **`admin.html`**: A protected route for inventory management.

### Logic & Backend

- **`script.js`**: The brain of the application. Handles DOM manipulation, state management (User session, Cart), and business logic.
- **`server.js`**: A Node.js/Express REST API that handles CRUD operations for books and authentication.

## ⚡ Dynamic Implementation Details

- **Data Persistence**: The application checks for a backend server; if unavailable, it automatically initializes a robust `localStorage` database with sample data.
- **Smart Rendering**: Book cards, cart items, and profile history are generated via JavaScript templates, allowing for instant updates without page reloads.
- **State Synchronization**: Uses the `storage` event listener to sync cart and login state across multiple open tabs in real-time.
- **Content Parsing**: The Reader component dynamically splits long HTML content into readable pages based on character count and paragraph breaks.
