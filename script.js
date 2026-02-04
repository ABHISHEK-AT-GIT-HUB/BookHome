// ===== Global Variables =====
let currentUser = null;
let currentAdmin = null;
let cart = [];
let currentPage = 1;
let totalPages = 10;
let currentBookId = null;
let readerTheme = "light";

// ===== Toast Notifications =====
function showToast(message, type = "success", title = "") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ""}
            <div class="toast-message">${message}</div>
        </div>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// ===== Loading Spinner =====
function showLoading() {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.classList.add("active");
  }
}

function hideLoading() {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.classList.remove("active");
  }
}

// ===== Scroll to Top =====
function initializeScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTop");
  if (!scrollBtn) return;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ===== Profile Modal =====
function initializeProfileModal() {
  const profileLink = document.getElementById("profileLink");
  if (profileLink) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentUser) {
        showProfile();
      } else {
        showToast("Please login to view your profile", "warning");
        window.location.href = "login.html";
      }
    });
  }
}

function showProfile() {
  if (!currentUser) return;

  const profileContent = document.getElementById("profileContent");
  if (!profileContent) return;

  // Get user orders
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const userOrders = orders.filter(
    (order) => order.userEmail === currentUser.email,
  );

  // Get user messages
  const messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
  const userMessages = messages.filter(
    (msg) => msg.email === currentUser.email,
  );

  // Styles for profile design
  const styles = `
    <style>
      .profile-header-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
      }
      .profile-avatar-large {
        width: 80px;
        height: 80px;
        background: var(--primary-color, #4a90e2);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .profile-name { margin: 0 0 5px 0; font-size: 1.5rem; }
      .profile-email { margin: 0; color: #666; }
      .profile-section { margin-bottom: 30px; }
      .profile-section h3 { 
        border-left: 4px solid var(--primary-color, #4a90e2);
        padding-left: 10px;
        margin-bottom: 15px;
        font-size: 1.2rem;
      }
      .profile-list { display: flex; flex-direction: column; gap: 15px; }
      .profile-card {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 15px;
        transition: transform 0.2s;
      }
      .profile-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .card-date { font-size: 0.85rem; color: #888; }
      .card-status { font-weight: bold; color: #28a745; font-size: 0.85rem; }
      .card-content { font-size: 0.95rem; color: #333; line-height: 1.4; }
      .empty-state { text-align: center; padding: 20px; color: #888; background: #f8f9fa; border-radius: 8px; font-style: italic; }
      [data-theme="dark"] .profile-card, [data-theme="dark"] .empty-state { background: #2d2d2d; border-color: #444; }
      [data-theme="dark"] .card-content { color: #ddd; }
      [data-theme="dark"] .profile-email { color: #aaa; }
    </style>
  `;

  let ordersHTML = "";
  if (userOrders.length === 0) {
    ordersHTML =
      '<div class="empty-state">No orders yet. Start shopping to see your orders here!</div>';
  } else {
    ordersHTML = userOrders
      .map(
        (order) => `
            <div class="profile-card">
                <div class="card-row">
                    <span class="card-date">${new Date(order.timestamp).toLocaleDateString()}</span>
                    <span class="card-status">Completed</span>
                </div>
                <div class="card-content">
                    <strong>Order #${order.id.toString().slice(-6)}</strong><br>
                    Items: ${order.items.length} | Total: Rs.${order.total.toFixed(2)}
                </div>
            </div>
        `,
      )
      .join("");
  }

  let messagesHTML = "";
  if (userMessages.length === 0) {
    messagesHTML = '<div class="empty-state">No messages sent yet.</div>';
  } else {
    messagesHTML = userMessages
      .map(
        (msg) => `
      <div class="profile-card">
        <div class="card-row">
          <span class="card-date">${new Date(msg.date).toLocaleDateString()}</span>
          <span class="card-status" style="color: var(--primary-color)">Sent</span>
        </div>
        <div class="card-content">
          "${msg.message}"
        </div>
      </div>
    `,
      )
      .join("");
  }

  profileContent.innerHTML = `
        ${styles}
        <div class="profile-header-section">
            <div class="profile-avatar-large">
                ${currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 class="profile-name">${currentUser.name}</h2>
            <p class="profile-email">${currentUser.email}</p>
        </div>
        
        <div class="profile-section">
            <h3>My Orders</h3>
            <div class="profile-list">
                ${ordersHTML}
            </div>
        </div>

        <div class="profile-section">
            <h3>My Messages</h3>
            <div class="profile-list">
                ${messagesHTML}
            </div>
        </div>
    `;

  openModal("profileModal");
}

// ===== Book Details Modal =====
async function showBookDetails(bookId) {
  const book = await getBookById(bookId);

  if (!book) {
    showToast("Book not found", "error");
    return;
  }

  const bookDetailsContent = document.getElementById("bookDetailsContent");
  if (!bookDetailsContent) return;

  const priceDisplay =
    book.price == 0
      ? '<span class="book-details-price">FREE</span>'
      : `<span class="book-details-price">Rs.${book.price}</span>`;

  const stock = book.stock !== undefined ? book.stock : 20;
  let stockHtml = "";
  let actionBtn = "";

  if (stock === 0) {
    stockHtml = '<div class="detail-stock-badge out">Out of Stock</div>';
    actionBtn = `<button class="btn-notify" onclick="notifyMe(${book.id}); closeModal('bookDetailsModal');">Notify Me</button>`;
  } else {
    const stockText =
      stock < 10
        ? `Hurry! Only ${stock} left`
        : `In Stock (${stock} available)`;
    const stockClass = stock < 10 ? "low" : "in";
    stockHtml = `<div class="detail-stock-badge ${stockClass}">${stockText}</div>`;

    if (book.price > 0) {
      actionBtn = `<button class="btn-cart" onclick="addToCart(${book.id}); closeModal('bookDetailsModal');">Add to Cart</button>`;
    }
  }

  bookDetailsContent.innerHTML = `
        <div class="book-details-content">
            <div class="book-details-image-container">
                <img src="${book.image}" alt="${
                  book.title
                }" class="book-details-image" onerror="this.style.display='none'">
            </div>
            <div class="book-details-info">
                <div class="book-header">
                    <h2>${book.title}</h2>
                    <p class="book-details-author">by ${book.author}</p>
                </div>
                <div class="book-meta">
                    ${priceDisplay}
                    ${stockHtml}
                </div>
                <div class="book-details-description">
                    <h3>Description</h3>
                    <p>${book.description}</p>
                </div>
                <div class="book-details-actions">
                    <button class="btn-read" onclick="readBook(${
                      book.id
                    }); closeModal('bookDetailsModal');">Read Now</button>
                    ${actionBtn}
                </div>
            </div>
        </div>
    `;

  openModal("bookDetailsModal");
}

// ===== Initialize App =====
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Seed sample data if empty
  initializeSampleData();

  // Load theme preference
  loadTheme();

  // Initialize based on current page
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (currentPage === "index.html" || currentPage === "") {
    initializeHomePage();
  } else if (currentPage === "services.html") {
    initializeServicesPage();
  } else if (currentPage === "contact.html") {
    initializeContactPage();
  } else if (currentPage === "admin.html") {
    initializeAdminPage();
  } else if (currentPage === "reader.html") {
    initializeReaderPage();
  } else if (currentPage === "login.html" || currentPage === "signup.html") {
    // Auth is handled in common initializations
  }

  // Common initializations
  initializeNavigation();
  initializeModals();
  initializeAuth();
  initializeThemeToggle();
  initializeScrollToTop();
  initializeProfileModal();
  loadCart();
  updateCartCount();
  initializeCartLogic();

  // Listen for storage changes to sync across tabs (Local Mode)
  window.addEventListener("storage", (e) => {
    if (e.key === "books") {
      refreshBooks();
    }
  });

  // Refresh data when tab becomes visible (API Mode sync)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshBooks();
    }
  });
}

function initializeSampleData() {
  const books = localStorage.getItem("books");
  if (!books || JSON.parse(books).length === 0) {
    const sampleBooks = [
      {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        price: "0.00",
        image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        description:
          "A tragic love story that explores themes of wealth, class, and the elusive nature of the American Dream.",
        content: `<h2>Overview</h2>
          <p><strong>The Great Gatsby</strong> by F. Scott Fitzgerald is a timeless exploration of love, obsession, and the illusion of the American Dream. Set in the Roaring Twenties, the story follows the mysterious millionaire Jay Gatsby and his unrelenting desire to reunite with Daisy Buchanan, a woman he once loved. Through the eyes of narrator Nick Carraway, readers are drawn into a glittering world of lavish parties, greed, and hidden sorrow.</p>

          <h2>Story Summary</h2>
          <p>Nick Carraway, a Yale graduate and war veteran, moves to West Egg, Long Island, next door to Gatsby’s grand mansion. Every weekend, Gatsby throws extravagant parties attended by the social elite. Yet beneath the glamour, Gatsby’s heart aches for Daisy, now married to Tom Buchanan. As Nick becomes Gatsby’s confidant, he learns that Gatsby’s fortune and his mansion were all built for one purpose — to win Daisy back. The dream, however, is built on illusion, corruption, and tragedy.</p>

          <h2>Key Themes</h2>
          <ul>
            <li><strong>The American Dream:</strong> The novel examines how ambition and materialism distort one’s pursuit of happiness.</li>
            <li><strong>Love and Illusion:</strong> Gatsby’s love for Daisy represents both beauty and the danger of idealization.</li>
            <li><strong>Class and Morality:</strong> Fitzgerald critiques the moral emptiness of the wealthy elite.</li>
          </ul>

          <h2>Excerpt</h2>
          <p>"In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since: 'Whenever you feel like criticizing anyone, just remember that all the people in this world haven’t had the advantages that you’ve had.'"</p>

          <p>Through poetic prose and haunting imagery, <em>The Great Gatsby</em> remains one of America’s greatest novels — a portrait of desire, illusion, and loss that continues to resonate with readers nearly a century later.</p>`,
        category: "free",
        createdAt: new Date().toISOString(),
        stock: 15,
      },
      {
        id: 2,
        title: "1984",
        author: "George Orwell",
        price: "499.00",
        image: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        description:
          "A chilling vision of totalitarianism, surveillance, and loss of individual freedom in a dystopian world.",
        content: `<h2>Overview</h2>
          <p><strong>1984</strong> by George Orwell is a dystopian masterpiece set in a world ruled by perpetual war, omnipresent surveillance, and the all-powerful Party led by Big Brother. Written in 1949, the book remains one of the most profound warnings against authoritarianism and manipulation of truth.</p>

          <h2>Story Summary</h2>
          <p>The story follows Winston Smith, a low-ranking member of the Party who works at the Ministry of Truth, altering historical records to fit the regime’s propaganda. Constantly watched by telescreens and haunted by the Thought Police, Winston secretly despises Big Brother and dreams of rebellion. He begins a forbidden love affair with Julia, a fellow worker, and they attempt to find freedom in a society where even thought is policed.</p>

          <p>As the story unfolds, Winston and Julia’s small act of defiance leads to betrayal, torture, and re-education in the Ministry of Love. Orwell’s haunting narrative captures the horror of a system that destroys individuality, truth, and love.</p>

          <h2>Key Themes</h2>
          <ul>
            <li><strong>Surveillance and Control:</strong> “Big Brother is watching you” symbolizes the invasive reach of totalitarianism.</li>
            <li><strong>Language and Truth:</strong> Newspeak demonstrates how language can be manipulated to limit freedom of thought.</li>
            <li><strong>Individuality vs. Conformity:</strong> Winston’s struggle represents the human spirit’s resistance against oppression.</li>
          </ul>

          <h2>Excerpt</h2>
          <p>“It was a bright cold day in April, and the clocks were striking thirteen.”</p>

          <p>Bleak yet deeply insightful, <em>1984</em> remains a warning of how absolute power corrupts absolutely, and how truth can vanish when freedom is lost.</p>`,
        category: "selling",
        createdAt: new Date().toISOString(),
        stock: 8,
      },
      {
        id: 3,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: "299.00",
        image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        description:
          "A witty and romantic exploration of manners, marriage, and society in 19th-century England.",
        content: `<h2>Overview</h2>
          <p><strong>Pride and Prejudice</strong> by Jane Austen is one of the most beloved novels in English literature, combining romance, humor, and social commentary. It follows Elizabeth Bennet, a sharp-minded young woman who challenges the conventions of her time while navigating love, class, and family expectations.</p>

          <h2>Story Summary</h2>
          <p>Set in the English countryside, the novel opens with the famous line: “It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.” Elizabeth lives with her four sisters and her well-meaning but foolish mother, who is determined to see them all married. When wealthy bachelor Mr. Bingley arrives, the Bennet family’s hopes rise — but it is Mr. Darcy, Bingley’s proud and reserved friend, who captures Elizabeth’s interest, and disdain.</p>

          <p>Through misunderstandings, social clashes, and growing self-awareness, both Elizabeth and Darcy confront their pride and prejudice. Their eventual union represents a triumph of personal growth and mutual respect over superficial judgment.</p>

          <h2>Key Themes</h2>
          <ul>
            <li><strong>Love and Marriage:</strong> The novel questions the link between wealth and marriage.</li>
            <li><strong>Social Class:</strong> Austen critiques the rigid class divisions of Georgian England.</li>
            <li><strong>Self-Knowledge:</strong> True happiness, Austen suggests, requires humility and understanding.</li>
          </ul>

          <h2>Excerpt</h2>
          <p>“She is tolerable; but not handsome enough to tempt me.” — Mr. Darcy</p>

          <p>Through its wit, irony, and insight into human nature, <em>Pride and Prejudice</em> endures as one of the most charming and relevant novels ever written.</p>`,
        category: "selling",
        createdAt: new Date().toISOString(),
        stock: 0,
      },
      {
        id: 4,
        title: "Moby-Dick",
        author: "Herman Melville",
        price: "299.00",
        image: "https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg",
        description:
          "A profound tale of obsession, revenge, and the relentless pursuit of the white whale.",
        content: `<h2>Overview</h2>
          <p><strong>Moby-Dick</strong> is Herman Melville’s epic novel about Captain Ahab’s monomaniacal quest to hunt down the great white whale that maimed him. A blend of adventure, philosophy, and poetic reflection, the novel explores the limits of human understanding and the destructive power of obsession.</p>

          <h2>Story Summary</h2>
          <p>The story begins with the iconic line “Call me Ishmael.” Ishmael, a sailor seeking adventure, joins the whaling ship <em>Pequod</em> under the command of the enigmatic Captain Ahab. As the ship sails across the oceans, Ishmael and the multicultural crew encounter storms, strange creatures, and Ahab’s growing madness. Ahab’s sole purpose is revenge — to kill Moby Dick, the whale that took his leg.</p>

          <p>The voyage becomes a metaphysical journey, questioning man’s relationship with nature and the divine. Melville’s vivid descriptions of the sea, the ship’s rituals, and the grandeur of the whale elevate the novel into a study of humanity’s deepest fears and ambitions.</p>

          <h2>Key Themes</h2>
          <ul>
            <li><strong>Obsession:</strong> Ahab’s fixation on Moby Dick leads to destruction.</li>
            <li><strong>Fate vs. Free Will:</strong> The characters struggle between destiny and choice.</li>
            <li><strong>Nature’s Power:</strong> The sea symbolizes both mystery and menace.</li>
          </ul>

          <h2>Excerpt</h2>
          <p>“From hell’s heart I stab at thee; for hate’s sake I spit my last breath at thee!” — Captain Ahab</p>

          <p>Rich in symbolism and psychological depth, <em>Moby-Dick</em> is both a thrilling adventure and a philosophical masterpiece that continues to captivate readers.</p>`,
        category: "selling",
        createdAt: new Date().toISOString(),
        stock: 5,
      },
      {
        id: 5,
        title: "A Tale of Two Cities",
        author: "Charles Dickens",
        price: "299.00",
        image: "https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg",
        description:
          "A historical epic of love, sacrifice, and redemption set during the French Revolution.",
        content: `<h2>Overview</h2>
          <p><strong>A Tale of Two Cities</strong> is one of Charles Dickens’s most celebrated works, set against the turbulent backdrop of the French Revolution. It is a story of political upheaval, personal transformation, and the enduring power of love and sacrifice.</p>

          <h2>Story Summary</h2>
          <p>The novel opens with one of literature’s most famous lines: “It is a best of times, it was the worst of times...” The story alternates between London and Paris, following the lives of Charles Darnay, a French nobleman who rejects his family’s cruelty, and Sydney Carton, a disillusioned English lawyer. Both men love the same woman — Lucie Manette, the daughter of a wrongfully imprisoned man.</p>

          <p>As revolution erupts in France, Darnay is condemned to death by the guillotine. In a final act of redemption, Carton sacrifices himself to save Darnay, uttering the immortal words: “It is a far, far better thing that I do, than I have ever done.”</p>

          <h2>Key Themes</h2>
          <ul>
            <li><strong>Resurrection and Sacrifice:</strong> The story emphasizes renewal through love and selflessness.</li>
            <li><strong>Revolution and Injustice:</strong> Dickens portrays both the cruelty of aristocracy and the fury of the oppressed.</li>
            <li><strong>Duality:</strong> The “two cities” symbolize contrasts between peace and chaos, love and hate.</li>
          </ul>

          <h2>Excerpt</h2>
          <p>“It is a far, far better rest that I go to than I have ever known.”</p>

          <p>With unforgettable characters and moral grandeur, <em>A Tale of Two Cities</em> stands as one of Dickens’s most powerful portrayals of human courage and compassion in times of darkness.</p>`,
        category: "selling",
        createdAt: new Date().toISOString(),
        stock: 12,
      },
    ];
    localStorage.setItem("books", JSON.stringify(sampleBooks));
  }
}

function initializeAuth() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
}

// ===== Theme Management =====
function initializeThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const readerThemeToggle = document.getElementById("readerThemeToggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    updateThemeButton();
  }

  if (readerThemeToggle) {
    readerThemeToggle.addEventListener("click", toggleReaderTheme);
    updateReaderThemeButton();
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButton();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton();
}

function updateThemeButton() {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  }
}

function toggleReaderTheme() {
  readerTheme = readerTheme === "dark" ? "light" : "dark";
  const readerContent = document.getElementById("readerContent");
  if (readerContent) {
    readerContent.setAttribute("data-theme", readerTheme);
    localStorage.setItem("readerTheme", readerTheme);
  }
  updateReaderThemeButton();
}

function updateReaderThemeButton() {
  const readerThemeToggle = document.getElementById("readerThemeToggle");
  if (readerThemeToggle) {
    readerThemeToggle.textContent = readerTheme === "dark" ? "☀️" : "🌙";
  }
}

// ===== Navigation =====
function initializeNavigation() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.textContent.startsWith("Logout")) return;
        navMenu.classList.remove("active");
      });
    });
  }

  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }

  updateLoginLink();

  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("cartModal");
      displayCart();
    });
  }
}

function updateLoginLink() {
  const loginLink = document.getElementById("loginLink");
  const profileLink = document.getElementById("profileLink");

  if (loginLink && currentUser) {
    loginLink.textContent = `Logout (${currentUser.name})`;
    loginLink.href = "#";
    loginLink.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  } else if (loginLink) {
    loginLink.textContent = "Login";
    loginLink.href = "login.html";
    loginLink.onclick = null;
  }

  if (profileLink) {
    profileLink.style.display = currentUser ? "block" : "none";
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showToast("Logged out successfully!", "success", "Logout");
  window.location.href = "index.html";
}

// ===== Modals =====
function initializeModals() {
  // Close modals on X click
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal.active");
      if (openModal) {
        closeModal(openModal.id);
      }
    }
  });

  // Terms link
  const termsLink = document.getElementById("termsLink");
  if (termsLink) {
    termsLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("termsModal");
    });
  }

  // Admin login link
  const adminLoginLink = document.getElementById("adminLoginLink");
  if (adminLoginLink) {
    adminLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("adminLoginModal");
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("active");
    document.body.classList.add("modal-open");

    // Make edit modal scrollable
    const modalContent = modal.querySelector(".modal-content");
    if (modalId === "editBookModal" && modalContent) {
      modalContent.classList.add("scrollable");
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
      modalContent.classList.remove("scrollable");
    }
  }
}

// ===== User Authentication =====
function initializeHomePage() {
  // Load featured books
  loadFeaturedBooks();
  loadTopRatedBooks();
}

async function loadTopRatedBooks() {
  // This is a simplified version. In a real app, you'd fetch books with high ratings.
  try {
    const books = await getBooks();
    const container = document.getElementById("topRatedBooks");

    if (!container) return;

    // Let's feature different books here, e.g., from index 1 to 5
    const topBooks = books.slice(1, 5);

    if (topBooks.length === 0) {
      container.innerHTML =
        '<div class="no-results">No top rated books available.</div>';
    } else {
      container.innerHTML = topBooks
        .map((book) => createBookCard(book))
        .join("");
      attachBookCardListeners();
    }
  } catch (error) {
    console.error("Error loading top rated books:", error);
  }
}

function handleSignup(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const nameInput = e.target.querySelector('input[type="text"]');
  const emailInput = e.target.querySelector('input[type="email"]');
  const passwordInput = e.target.querySelector('input[type="password"]');

  const name = nameInput ? nameInput.value : "";
  const email = emailInput ? emailInput.value : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!name || !email || !password) {
    showToast("Please fill all fields", "warning");
    return;
  }

  // Get existing users
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!Array.isArray(users)) users = [];
  } catch (error) {
    users = [];
  }

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    showToast(
      "User already exists! Please login.",
      "warning",
      "Sign Up Failed",
    );
    return;
  }

  // Add new user
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showToast("Sign up successful! Please login.", "success", "Account Created");
  e.target.reset();
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

function handleLogin(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('input[type="email"]');
  const passwordInput = e.target.querySelector('input[type="password"]');

  const email = emailInput ? emailInput.value : "";
  const password = passwordInput ? passwordInput.value : "";

  // Get users
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!Array.isArray(users)) users = [];
  } catch (error) {
    users = [];
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateLoginLink();
    showToast("Welcome back!", "success", "Login Successful");
    e.target.reset();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  } else {
    showToast("Invalid email or password!", "error", "Login Failed");
  }
}

// ===== Book Data Management =====
async function getBooks() {
  try {
    const response = await fetch("/api/books");
    if (response.ok) {
      const data = await response.json();
      if (data.success) return data.books;
    }
  } catch (error) {
    console.warn("Server unreachable, using local storage");
  }

  try {
    if (window.BookAPI) {
      return await BookAPI.getBooks();
    }
    // Fallback if API not loaded
    const books = localStorage.getItem("books");
    return books ? JSON.parse(books) : [];
  } catch (error) {
    console.error("Error fetching books:", error);
    const books = localStorage.getItem("books");
    return books ? JSON.parse(books) : [];
  }
}

async function getBookById(id) {
  try {
    const response = await fetch(`/api/books/${id}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success) return data.book;
    }
  } catch (error) {
    console.warn("Server unreachable, using local storage");
  }

  try {
    if (window.BookAPI) {
      return await BookAPI.getBookById(id);
    }
    const books = await getBooks();
    return books.find((book) => book.id === parseInt(id));
  } catch (error) {
    console.error("Error fetching book:", error);
    const books = await getBooks();
    return books.find((book) => book.id === parseInt(id));
  }
}

// ===== Home Page =====
async function loadFeaturedBooks() {
  showLoading();
  try {
    const books = await getBooks();
    const container = document.getElementById("featuredBooks");
    const searchInput = document.getElementById("searchInput");
    const sectionTitle = document.querySelector(
      ".featured-section .section-title",
    );

    const renderBooks = (booksToRender) => {
      if (!container) return;

      if (booksToRender.length === 0) {
        container.innerHTML =
          '<div class="no-results">No books found matching your search.</div>';
      } else {
        container.innerHTML = booksToRender
          .map((book) => createBookCard(book))
          .join("");
        attachBookCardListeners();
      }
    };

    // Initial render (Top 9)
    renderBooks(books.slice(0, 9));

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm === "") {
          renderBooks(books.slice(0, 9));
          if (sectionTitle) sectionTitle.textContent = "Featured Books";
        } else {
          const filtered = books.filter(
            (b) =>
              b.title.toLowerCase().includes(searchTerm) ||
              b.author.toLowerCase().includes(searchTerm),
          );
          renderBooks(filtered);
          if (sectionTitle) sectionTitle.textContent = "Search Results";
        }
      });
    }
  } catch (error) {
    console.error("Error loading featured books:", error);
    showToast("Failed to load books", "error");
  } finally {
    hideLoading();
  }
}

// Global refresh function for dynamic updates
window.refreshBooks = async function () {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (currentPage === "index.html" || currentPage === "") {
    await loadFeaturedBooks();
  } else if (currentPage === "services.html") {
    await loadAllBooks();
  }
};

// ===== Services Page =====
function initializeServicesPage() {
  // Category tabs
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterBooks(btn.dataset.category);
    });
  });

  // Load all books
  loadAllBooks();
}

function initializeCartLogic() {
  // Cart functionality
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
      if (!currentUser) {
        showToast("Please login to place an order.", "warning");
        window.location.href = "login.html";
        return;
      }
      // Pre-fill shipping name
      const shippingNameInput = document.getElementById("shippingName");
      if (shippingNameInput && currentUser) {
        shippingNameInput.value = currentUser.name;
      }

      // Show estimated delivery date in modal title
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      const dateStr = deliveryDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const modalTitle = document.querySelector("#paymentModal h2");
      if (modalTitle)
        modalTitle.innerHTML = `Checkout Details <div style="font-size:0.9rem; color:var(--primary-color); margin-top:5px">Estimated Delivery: ${dateStr}</div>`;

      closeModal("cartModal");
      openModal("paymentModal");
    });
  }

  // Payment form
  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", handlePayment);

    // Show/hide payment fields based on selection
    const paymentOptions = paymentForm.querySelectorAll(
      'input[name="payment"]',
    );
    paymentOptions.forEach((option) => {
      option.addEventListener("change", () => {
        const upiFields = document.getElementById("upiFields");
        const cardFields = document.getElementById("cardFields");

        if (option.value === "upi") {
          upiFields.style.display = "block";
          cardFields.style.display = "none";
        } else if (option.value === "card") {
          upiFields.style.display = "none";
          cardFields.style.display = "block";
        } else {
          upiFields.style.display = "none";
          cardFields.style.display = "none";
        }
      });
    });
  }
}

async function loadAllBooks() {
  showLoading();
  try {
    const books = await getBooks();
    const container = document.getElementById("booksGrid");

    if (container) {
      container.innerHTML = books.map((book) => createBookCard(book)).join("");
      attachBookCardListeners();
    }
  } catch (error) {
    console.error("Error loading books:", error);
    showToast("Failed to load books", "error");
  } finally {
    hideLoading();
  }
}

async function filterBooks(category) {
  showLoading();
  try {
    const books = await getBooks();
    let filteredBooks = books;

    if (category !== "all") {
      filteredBooks = books.filter((book) => book.category === category);
    }

    const container = document.getElementById("booksGrid");
    if (container) {
      container.innerHTML = filteredBooks
        .map((book) => createBookCard(book))
        .join("");
      attachBookCardListeners();
    }
  } catch (error) {
    console.error("Error filtering books:", error);
    showToast("Failed to filter books", "error");
  } finally {
    hideLoading();
  }
}

function createBookCard(book) {
  const priceDisplay =
    book.price == 0
      ? '<span class="book-price">FREE</span>'
      : `<span class="book-price">Rs.${book.price}</span>`;

  const stock = book.stock !== undefined ? book.stock : 20;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock < 10;

  let stockHtml = "";
  let actionBtn = "";

  if (isOutOfStock) {
    stockHtml = '<span class="stock-badge out">Out of Stock</span>';
    actionBtn = `<button class="btn-notify" onclick="notifyMe(${book.id})">Notify Me</button>`;
  } else {
    if (isLowStock)
      stockHtml = `<span class="stock-badge low">Only ${stock} left!</span>`;
    actionBtn =
      book.price > 0
        ? `<button class="btn-cart" onclick="addToCart(${book.id})">Add to Cart</button>`
        : "";
  }

  return `
        <div class="book-card" data-book-id="${
          book.id
        }" onclick="showBookDetails(${book.id})">
            <div class="book-image">
                <img src="${book.image}" alt="${
                  book.title
                }" onerror="this.parentElement.innerHTML='📚'">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                ${priceDisplay}
                ${stockHtml}
                <div class="book-actions" onclick="event.stopPropagation();">
                    <button class="btn-read" onclick="readBook(${
                      book.id
                    })">Read Now</button>
                    ${actionBtn}
                </div>
            </div>
        </div>
    `;
}

function attachBookCardListeners() {
  // Click handlers are added inline in createBookCard
}

// ===== Cart Management =====
async function addToCart(bookId) {
  if (!currentUser) {
    showToast(
      "Please login to add items to cart!",
      "warning",
      "Login Required",
    );
    window.location.href = "login.html";
    return;
  }

  const books = await getBooks();
  const book = books.find((b) => b.id === bookId);

  if (!book || book.price == 0) {
    showToast(
      'This book is free! Click "Read Now" to read it.',
      "info",
      "Free Book",
    );
    return;
  }

  const stock = book.stock !== undefined ? book.stock : 20;
  const existingItem = cart.find((item) => item.id === bookId);
  const currentQty = existingItem ? existingItem.quantity : 0;

  if (currentQty + 1 > stock) {
    showToast(`Sorry, only ${stock} copies available!`, "error", "Stock Limit");
    return;
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Store max stock in cart item for validation in cart view
    cart.push({ ...book, quantity: 1, maxStock: stock });
  }

  saveCart();
  updateCartCount();
  showToast("Book added to cart!", "success", "Cart Updated");
}

function removeFromCart(bookId) {
  cart = cart.filter((item) => item.id !== bookId);
  saveCart();
  updateCartCount();
  displayCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItems.innerHTML = cart
        .map(
          (item) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.style.display='none'">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>Rs.${(
                          parseFloat(item.price) * item.quantity
                        ).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartQuantity(${
                          item.id
                        }, ${item.quantity - 1})">-</button>
                        <input type="number" value="${
                          item.quantity
                        }" min="1" onchange="updateCartQuantity(${
                          item.id
                        }, parseInt(this.value))" />
                        <button class="quantity-btn" onclick="updateCartQuantity(${
                          item.id
                        }, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `,
        )
        .join("");
    }
  }

  if (cartTotal) {
    const total = cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    cartTotal.textContent = total.toFixed(2);
  }
}

function updateCartQuantity(bookId, newQuantity) {
  const item = cart.find((i) => i.id === bookId);
  if (!item) return;

  if (newQuantity < 1) {
    removeFromCart(bookId);
  } else if (newQuantity <= (item.maxStock || 20)) {
    item.quantity = newQuantity;
    saveCart();
    updateCartCount();
    displayCart();
  } else {
    showToast(`Sorry, only ${item.maxStock} copies available!`, "warning");
  }
}

// ===== Payment =====
function handlePayment(e) {
  e.preventDefault();

  // Get address details
  const shippingName = document.getElementById("shippingName").value;
  const shippingPhone = document.getElementById("shippingPhone").value;
  const shippingAddress = document.getElementById("shippingAddress").value;
  const shippingCity = document.getElementById("shippingCity").value;
  const shippingState = document.getElementById("shippingState").value;
  const shippingZip = document.getElementById("shippingZip").value;

  const paymentMethod = e.target.querySelector(
    'input[name="payment"]:checked',
  ).value;

  if (
    !shippingName ||
    !shippingPhone ||
    !shippingAddress ||
    !shippingCity ||
    !shippingState ||
    !shippingZip
  ) {
    showToast("Please fill all shipping details", "warning", "Checkout Error");
    return;
  }

  if (paymentMethod === "upi") {
    const upiId = document.getElementById("upiId").value;
    if (!upiId) {
      showToast("Please enter UPI ID", "warning", "Payment Error");
      return;
    }
  } else if (paymentMethod === "card") {
    const cardNumber = document.getElementById("cardNumber").value;
    const cardExpiry = document.getElementById("cardExpiry").value;
    const cardCVV = document.getElementById("cardCVV").value;

    if (!cardNumber || !cardExpiry || !cardCVV) {
      showToast("Please fill all card details", "warning", "Payment Error");
      return;
    }
  }

  // Simulate payment processing
  showLoading();
  setTimeout(() => {
    // Calculate Delivery Date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const formattedDate = deliveryDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Save order
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const total = cart.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    const order = {
      id: Date.now(),
      userEmail: currentUser.email,
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: parseFloat(item.price),
        quantity: item.quantity,
      })),
      total: total,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      shippingDetails: {
        estimatedDelivery: formattedDate,
        name: shippingName,
        phone: shippingPhone,
        address: shippingAddress,
        city: shippingCity,
        state: shippingState,
        zip: shippingZip,
      },
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Update Stock in LocalStorage
    const books = JSON.parse(localStorage.getItem("books") || "[]");
    cart.forEach((cartItem) => {
      const bookIndex = books.findIndex((b) => b.id === cartItem.id);
      if (bookIndex > -1) {
        const currentStock =
          books[bookIndex].stock !== undefined ? books[bookIndex].stock : 20;
        books[bookIndex].stock = Math.max(0, currentStock - cartItem.quantity);
      }
    });
    localStorage.setItem("books", JSON.stringify(books));

    // Refresh UI if function exists
    if (window.refreshBooks) window.refreshBooks();

    hideLoading();
    showToast(
      `Order placed! Arriving by ${formattedDate}`,
      "success",
      "Order Confirmed",
    );

    cart = [];
    saveCart();
    updateCartCount();
    closeModal("paymentModal");
    displayCart();
    e.target.reset();
  }, 1500);
}

// ===== Book Reader =====
function readBook(bookId) {
  currentBookId = bookId;
  window.location.href = `reader.html?id=${bookId}`;
}

async function initializeReaderPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = parseInt(urlParams.get("id"));

  if (!bookId) {
    document.getElementById("readerContent").innerHTML =
      "<p>Book not found.</p>";
    return;
  }

  const book = await getBookById(bookId);

  if (!book) {
    document.getElementById("readerContent").innerHTML =
      "<p>Book not found.</p>";
    return;
  }

  // Set book title
  const readerBookTitle = document.getElementById("readerBookTitle");
  if (readerBookTitle) {
    readerBookTitle.textContent = book.title;
  }

  // Load book content
  loadBookPage(book, 1);

  // Pagination
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadBookPage(book, currentPage);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadBookPage(book, currentPage);
      }
    });
  }

  // Load reader theme
  const savedReaderTheme = localStorage.getItem("readerTheme") || "light";
  readerTheme = savedReaderTheme;
  const readerContent = document.getElementById("readerContent");
  if (readerContent) {
    readerContent.setAttribute("data-theme", readerTheme);
  }
  updateReaderThemeButton();
}

function loadBookPage(book, page) {
  currentPage = page;
  const readerContent = document.getElementById("readerContent");
  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (!readerContent || !book.content) {
    if (readerContent) {
      readerContent.innerHTML = "<p>No content available for this book.</p>";
    }
    return;
  }

  // Split content into pages preserving formatting
  const content = book.content;
  let pages = [];

  // Try to split by chapters first (if content has heading tags)
  if (
    content.includes("<h2>") ||
    content.includes("<h1>") ||
    content.includes("<h3>")
  ) {
    // Split by heading tags while preserving them
    const headingRegex = /(<h[123][^>]*>.*?<\/h[123]>)/gi;
    const parts = content.split(headingRegex).filter((p) => p.trim());

    let currentPageContent = "";
    let currentPageLength = 0;
    const maxPageLength = 3000; // Approximate characters per page

    parts.forEach((part) => {
      const isHeading = /<h[123]/.test(part);
      const partLength = part.length;

      if (isHeading && currentPageLength > maxPageLength * 0.7) {
        // Start new page with this heading if current page is getting long
        if (currentPageContent.trim()) {
          pages.push(currentPageContent.trim());
        }
        currentPageContent = part;
        currentPageLength = partLength;
      } else {
        currentPageContent += part;
        currentPageLength += partLength;

        // If page is getting too long, split at next paragraph
        if (currentPageLength > maxPageLength) {
          // Try to split at paragraph boundaries
          const lastParaIndex = currentPageContent.lastIndexOf("</p>");
          if (lastParaIndex > maxPageLength * 0.5) {
            const pageContent = currentPageContent.substring(
              0,
              lastParaIndex + 4,
            );
            const remainingContent = currentPageContent.substring(
              lastParaIndex + 4,
            );
            pages.push(pageContent.trim());
            currentPageContent = remainingContent;
            currentPageLength = remainingContent.length;
          } else {
            // Force split
            pages.push(currentPageContent.trim());
            currentPageContent = "";
            currentPageLength = 0;
          }
        }
      }
    });

    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
  } else {
    // No headings, split by paragraphs or fixed length
    const paragraphs = content.split(/(<p[^>]*>.*?<\/p>|<br\s*\/?>|\n\n)/gi);
    let currentPageContent = "";
    let currentPageLength = 0;
    const maxPageLength = 3000;

    paragraphs.forEach((para) => {
      const paraLength = para.length;
      if (
        currentPageLength + paraLength > maxPageLength &&
        currentPageContent.trim()
      ) {
        pages.push(currentPageContent.trim());
        currentPageContent = para;
        currentPageLength = paraLength;
      } else {
        currentPageContent += para;
        currentPageLength += paraLength;
      }
    });

    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
    }
  }

  // Ensure at least one page
  if (pages.length === 0) {
    pages = [content];
  }

  totalPages = pages.length;
  const pageContent =
    pages[page - 1] || pages[0] || "<p>No content available for this page.</p>";

  // Preserve formatting by using innerHTML
  readerContent.innerHTML = pageContent;

  if (pageInfo) {
    pageInfo.textContent = `Page ${page} of ${totalPages}`;
  }

  if (prevBtn) {
    prevBtn.disabled = page === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = page >= totalPages;
  }
}

// ===== Contact Page =====
function initializeContactPage() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    // Pre-fill form if user is logged in
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      if (nameInput) nameInput.value = user.name;
      if (emailInput) emailInput.value = user.email;
    }
    contactForm.addEventListener("submit", handleContactSubmit);
  }
}

function handleContactSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // Send data via email client
  const subject = `Contact Message from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  window.location.href = `mailto:support@bookhome.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Save message to localStorage
  const messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
  messages.push({ name, email, message, date: new Date().toISOString() });
  localStorage.setItem("contactMessages", JSON.stringify(messages));

  showToast("Message sent successfully!", "success", "Thank You");
  e.target.reset();
}

// ===== Admin Panel =====
async function initializeAdminPage() {
  // Check admin authentication
  const savedAdmin = localStorage.getItem("currentAdmin");
  const savedToken = localStorage.getItem("adminToken");
  if (savedAdmin && savedToken) {
    currentAdmin = JSON.parse(savedAdmin);
    showAdminDashboard();
  } else {
    showAdminAuth();
  }

  // Auth tabs (login + signup only on admin page)
  const authTabs = document.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("adminLoginForm");
  const signupForm = document.getElementById("adminSignupForm");

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab;

      if (tabName === "login") {
        if (loginForm) loginForm.style.display = "block";
        if (signupForm) signupForm.style.display = "none";
      } else {
        if (loginForm) loginForm.style.display = "none";
        if (signupForm) signupForm.style.display = "block";
      }
    });
  });

  // Logout
  const adminLogout = document.getElementById("adminLogout");
  if (adminLogout) {
    adminLogout.addEventListener("click", () => {
      currentAdmin = null;
      localStorage.removeItem("currentAdmin");
      localStorage.removeItem("adminToken");
      showAdminAuth();
    });
  }

  // Add book form
  const addBookForm = document.getElementById("addBookForm");
  if (addBookForm) {
    addBookForm.addEventListener("submit", handleAddBook);
  }

  // Edit book form
  const editBookForm = document.getElementById("editBookForm");
  if (editBookForm) {
    editBookForm.addEventListener("submit", handleEditBook);
  }

  // Load admin books
  if (currentAdmin) {
    await loadAdminBooks();
  }
}

function showAdminAuth() {
  document.getElementById("adminAuth").style.display = "flex";
  document.getElementById("adminDashboard").style.display = "none";
}

async function showAdminDashboard() {
  const adminAuth = document.getElementById("adminAuth");
  const adminDashboard = document.getElementById("adminDashboard");

  if (adminAuth) adminAuth.style.display = "none";
  if (adminDashboard) {
    adminDashboard.style.display = "block";
    await loadAdminBooks();
  }
}

async function adminSignup() {
  const name = document.getElementById("adminSignupName").value;
  const email = document.getElementById("adminSignupEmail").value;
  const password = document.getElementById("adminSignupPassword").value;

  if (!name || !email || !password) {
    showToast("Please fill all fields", "warning", "Validation Error");
    return;
  }

  try {
    const response = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      // If 404, throw specific error to trigger fallback
      if (response.status === 404) throw new Error("API_NOT_FOUND");
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Signup failed");
    }

    const data = await response.json();
    const admin = data.admin || data.user || { name, email };
    const token = data.token || data.accessToken || null;

    // Save session
    currentAdmin = {
      id: admin.id || Date.now(),
      name: admin.name,
      email: admin.email,
    };
    localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));
    if (token) {
      localStorage.setItem("adminToken", token);
    }

    showToast(
      "Admin account created! You are now logged in.",
      "success",
      "Account Created",
    );
    await showAdminDashboard();
  } catch (error) {
    console.warn(
      "Admin signup API failed, falling back to localStorage:",
      error,
    );

    // Fallback to localStorage
    try {
      let admins = JSON.parse(localStorage.getItem("admins") || "[]");
      if (admins.find((a) => a.email === email)) {
        showToast("Admin already exists!", "warning", "Sign Up Failed");
        return;
      }

      const newAdmin = { id: Date.now(), name, email, password };
      admins.push(newAdmin);
      localStorage.setItem("admins", JSON.stringify(admins));

      currentAdmin = {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      };
      localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));

      showToast("Admin account created (Local)!", "success", "Account Created");
      await showAdminDashboard();
    } catch (localErr) {
      showToast(error.message || "Signup failed", "error", "Sign Up Failed");
    }
  }
}

async function adminLogin() {
  let emailInput = document.getElementById("adminLoginEmail");
  let passwordInput = document.getElementById("adminLoginPassword");

  // Also check for index page admin login
  if (!emailInput || !passwordInput) {
    emailInput = document.getElementById("adminLoginEmailIndex");
    passwordInput = document.getElementById("adminLoginPasswordIndex");
  }

  if (!emailInput || !passwordInput) {
    showToast("Please fill all fields", "warning", "Validation Error");
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    showToast("Please fill all fields", "warning", "Validation Error");
    return;
  }

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("API_NOT_FOUND");
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Login failed");
    }

    const data = await response.json();
    const admin = data.admin || data.user || { email };
    const token = data.token || data.accessToken || null;

    currentAdmin = {
      id: admin.id || Date.now(),
      name: admin.name || admin.email,
      email: admin.email,
    };
    localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));
    if (token) localStorage.setItem("adminToken", token);

    // Close modal if opened from index
    const adminModal = document.getElementById("adminLoginModal");
    if (
      adminModal &&
      (adminModal.style.display === "block" ||
        adminModal.classList.contains("active"))
    ) {
      closeModal("adminLoginModal");
      // Redirect to admin page
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 500);
    } else {
      await showAdminDashboard();
    }

    showToast("Welcome to Admin Panel!", "success", "Login Successful");
  } catch (error) {
    console.warn(
      "Admin login API failed, falling back to localStorage:",
      error,
    );

    // Fallback to localStorage
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    const admin = admins.find(
      (a) => a.email === email && a.password === password,
    );

    if (admin) {
      currentAdmin = { id: admin.id, name: admin.name, email: admin.email };
      localStorage.setItem("currentAdmin", JSON.stringify(currentAdmin));

      const adminModal = document.getElementById("adminLoginModal");
      if (
        adminModal &&
        (adminModal.style.display === "block" ||
          adminModal.classList.contains("active"))
      ) {
        closeModal("adminLoginModal");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 500);
      } else {
        await showAdminDashboard();
      }
      showToast(
        "Welcome to Admin Panel (Local)!",
        "success",
        "Login Successful",
      );
    } else {
      showToast("Invalid email or password", "error", "Login Failed");
    }
  }
}

async function handleAddBook(e) {
  e.preventDefault();
  const title = document.getElementById("bookTitle").value;
  const author = document.getElementById("bookAuthor").value;
  const price = parseFloat(document.getElementById("bookPrice").value);
  const stock = parseInt(document.getElementById("bookStock").value);
  const image = document.getElementById("bookImage").value;
  const description = document.getElementById("bookDescription").value;
  const content = document.getElementById("bookContent").value;
  const category = document.getElementById("bookCategory").value;

  if (!content || content.trim() === "") {
    showToast("Please enter book content", "warning", "Validation Error");
    return;
  }

  try {
    const bookData = {
      title,
      author,
      price: price.toFixed(2),
      stock: isNaN(stock) ? 20 : stock,
      image,
      description,
      content: content.trim(), // Preserve formatting
      category,
    };

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        showToast("Book added successfully!", "success", "Book Added");
        e.target.reset();
        await loadAdminBooks();
        if (window.refreshBooks) window.refreshBooks();
        return;
      }
    } catch (e) {
      console.warn("API failed, falling back to local");
    }

    if (window.BookAPI) {
      await BookAPI.addBook(bookData);
    } else {
      // Fallback to localStorage
      const books = await getBooks();
      books.push({
        id: Date.now(),
        ...bookData,
      });
      localStorage.setItem("books", JSON.stringify(books));
    }

    showToast("Book added successfully!", "success", "Book Added");
    e.target.reset();
    await loadAdminBooks();

    // Trigger refresh on other pages if they're open
    if (window.refreshBooks) {
      window.refreshBooks();
    }
  } catch (error) {
    console.error("Error adding book:", error);
    showToast("Failed to add book", "error", "Error");
  }
}

async function loadAdminBooks() {
  try {
    const books = await getBooks();
    const container = document.getElementById("adminBooksGrid");

    if (container) {
      container.innerHTML = books
        .map(
          (book) => `
            <div class="admin-book-card">
                <img src="${book.image}" alt="${book.title}" onerror="this.style.display='none'">
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p>Rs.${book.price} | Stock: ${book.stock !== undefined ? book.stock : 20} | ${book.category}</p>
                <div class="admin-book-actions">
                    <button class="btn-edit" onclick="editBook(${book.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading admin books:", error);
    showToast("Failed to load books", "error");
  }
}

async function editBook(bookId) {
  const book = await getBookById(bookId);

  if (!book) {
    showToast("Book not found", "error");
    return;
  }

  document.getElementById("editBookId").value = book.id;
  document.getElementById("editBookTitle").value = book.title;
  document.getElementById("editBookAuthor").value = book.author;
  document.getElementById("editBookPrice").value = book.price;
  document.getElementById("editBookStock").value =
    book.stock !== undefined ? book.stock : 20;
  document.getElementById("editBookImage").value = book.image;
  document.getElementById("editBookDescription").value = book.description;

  // Preserve content formatting exactly as stored
  const contentTextarea = document.getElementById("editBookContent");
  if (contentTextarea) {
    contentTextarea.value = book.content || "";
    // Auto-resize textarea to fit content (but keep scrollable)
    setTimeout(() => {
      contentTextarea.style.height = "auto";
      contentTextarea.style.height =
        Math.max(200, Math.min(400, contentTextarea.scrollHeight)) + "px";
    }, 100);
  }

  document.getElementById("editBookCategory").value = book.category;

  openModal("editBookModal");
}

async function handleEditBook(e) {
  e.preventDefault();
  const bookId = parseInt(document.getElementById("editBookId").value);
  const title = document.getElementById("editBookTitle").value;
  const author = document.getElementById("editBookAuthor").value;
  const price = parseFloat(document.getElementById("editBookPrice").value);
  const stock = parseInt(document.getElementById("editBookStock").value);
  const image = document.getElementById("editBookImage").value;
  const description = document.getElementById("editBookDescription").value;
  const content = document.getElementById("editBookContent").value;
  const category = document.getElementById("editBookCategory").value;

  if (!content || content.trim() === "") {
    showToast("Please enter book content", "warning", "Validation Error");
    return;
  }

  try {
    const bookData = {
      title,
      author,
      price: price.toFixed(2),
      stock: isNaN(stock) ? 0 : stock,
      image,
      description,
      content: content.trim(), // Preserve formatting
      category,
    };

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        showToast("Book updated successfully!", "success", "Book Updated");
        closeModal("editBookModal");
        await loadAdminBooks();
        if (window.refreshBooks) window.refreshBooks();
        return;
      }
    } catch (e) {
      console.warn("API failed, falling back to local");
    }

    if (window.BookAPI) {
      await BookAPI.updateBook(bookId, bookData);
    } else {
      // Fallback to localStorage
      const books = await getBooks();
      const bookIndex = books.findIndex((b) => b.id === bookId);
      if (bookIndex !== -1) {
        books[bookIndex] = {
          ...books[bookIndex],
          ...bookData,
        };
        localStorage.setItem("books", JSON.stringify(books));
      }
    }

    showToast("Book updated successfully!", "success", "Book Updated");
    closeModal("editBookModal");
    await loadAdminBooks();

    // Trigger refresh on other pages if they're open
    if (window.refreshBooks) {
      window.refreshBooks();
    }
  } catch (error) {
    console.error("Error updating book:", error);
    showToast("Failed to update book", "error", "Error");
  }
}

async function deleteBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    const response = await fetch(`/api/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showToast("Book deleted successfully!", "success", "Book Deleted");
      await loadAdminBooks();
      if (window.refreshBooks) window.refreshBooks();
      return;
    }
  } catch (e) {
    console.warn("API failed, falling back to local");
  }

  try {
    if (window.BookAPI) {
      await BookAPI.deleteBook(bookId);
    } else {
      // Fallback to localStorage
      const books = await getBooks();
      const filteredBooks = books.filter((b) => b.id !== bookId);
      localStorage.setItem("books", JSON.stringify(filteredBooks));
    }

    showToast("Book deleted successfully!", "success", "Book Deleted");
    await loadAdminBooks();

    // Trigger refresh on other pages if they're open
    if (window.refreshBooks) {
      window.refreshBooks();
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    showToast("Failed to delete book", "error", "Error");
  }
}

// ===== Notify Me Feature =====
function notifyMe(bookId) {
  let email = "";
  if (currentUser) {
    email = currentUser.email;
  } else {
    email = prompt(
      "Please enter your email address to be notified when this book is back in stock:",
    );
  }

  if (email) {
    // Save notification request
    const notifications = JSON.parse(
      localStorage.getItem("stockNotifications") || "[]",
    );
    notifications.push({
      bookId: bookId,
      email: email,
      date: new Date().toISOString(),
      status: "pending",
    });
    localStorage.setItem("stockNotifications", JSON.stringify(notifications));

    showToast(
      `Alert set! We will email ${email} when stock arrives.`,
      "success",
      "Notification Set",
    );
  }
}

// Make functions globally available
window.readBook = readBook;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.editBook = editBook;
window.deleteBook = deleteBook;
window.showBookDetails = showBookDetails;
window.closeModal = closeModal;
window.notifyMe = notifyMe;
