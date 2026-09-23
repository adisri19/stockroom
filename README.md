# StockRoom Admin Dashboard

A lightweight, high-performance product inventory admin dashboard built with Next.js 14 (App Router), React 18, Tailwind CSS, and Axios. Designed and built completely from scratch without component libraries or third-party table/query dependencies.

🚀 **Live Production Deployment:** [https://stockroom-sepia.vercel.app](https://stockroom-sepia.vercel.app)

---

## 1. Setup

### Prerequisites
- Node.js 18.17+ or newer (built & verified on Node 20+)
- npm 9+

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/adisri19/stockroom.git
cd stockroom

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

### Environment Variables & Credentials
No external environment variables are required. All requests target the DummyJSON public API:
- **Base URL:** `https://dummyjson.com`
- **Default Login:**
  - **Username:** `emilys`
  - **Password:** `emilyspass`

---

## 2. Features Completed

- [x] **Singleton Axios Instance (`src/lib/axios.js`)** with request auth interceptor (Bearer token) and response 401 interceptor (token clearance and login redirect).
- [x] **Authentication Context (`src/context/AuthContext.jsx`)** with persistent session restore from `localStorage`, login, logout, and token management.
- [x] **Route Protection (`src/components/auth/ProtectedRoute.jsx`)** guarding internal pages and showing a spinner during session validation.
- [x] **Sticky Navbar (`src/components/layout/Navbar.jsx`)** showing brand name, logged-in user credentials/avatar, and logout button.
- [x] **Product Table (`src/components/products/ProductTable.jsx`)** for desktop (`md+`) with striped rows, hover highlight, image thumbnails with SVG fallback, `$xx.xx` price formatting, star ratings, and edit/delete triggers.
- [x] **Mobile Product Cards (`src/components/products/ProductCard.jsx`)** for small viewports (`< md`) with matching product attributes and action buttons.
- [x] **Pagination Component (`src/components/ui/Pagination.jsx`)** with "Showing X–Y of Z", page sizes (10, 20, 50), bounded prev/next buttons, and windowed page numbers with ellipsis.
- [x] **Generic Debounce Hook (`src/hooks/useDebounce.js`)** applying a 400ms delay to search input.
- [x] **Product Data Hook (`src/hooks/useProducts.js`)** with pagination, query routing, client-side sorting, and race condition prevention.
- [x] **Category Filter & Sort (`src/app/products/page.jsx`)** supporting price, rating, and title sorting with mutual exclusion on search.
- [x] **Active Filter Indicators & Quick Reset** visual pill tags showing applied search, category, or sort parameters with one-click remove and reset all.
- [x] **Product Detail View (`src/app/products/[id]/page.jsx`)** with interactive image gallery switcher, full metadata, and customer reviews.
- [x] **Custom Not Found View (`src/app/products/[id]/not-found.jsx`)** for missing or invalid product IDs.
- [x] **Product Form (`src/components/products/ProductForm.jsx`)** supporting both Add and Edit with strict client-side validation, inline red errors, double-submit prevention, and Escape key dismissal.
- [x] **Delete Confirmation Modal (`src/components/products/DeleteModal.jsx`)** with product name prompt, cancel action, keyboard safety, and delete confirmation.
- [x] **Optimistic UI Updates** on product addition, update, and deletion without redundant API re-fetching.
- [x] **Toast Notifications (`src/components/ui/Toast.jsx`)** providing instantaneous accessible feedback on product creation, updates, and removals.
- [x] **Accessible UI Feedback States** including `Loader.jsx`, `ErrorState.jsx` with retry callback, and `EmptyState.jsx` with search term context and filter reset.

---

## 3. Decisions Made

### Search vs. Category: Mutual Exclusion
The DummyJSON API treats `/products/search?q=` and `/products/category/:category` as two independent endpoints; it does not support combining search terms and category filters in a single request. Rather than pretending they work together and confusing the user, I chose an explicit mutual exclusion design:
- When a user selects a category, any active search query is removed from the URL and state. The search input is visually disabled, cleared, and annotated with a tooltip badge reading *"Clear category to search"*.
- When a user types into the search box, the active category filter is reset to "All Categories" and cleared from the URL.
- When the category is cleared back to "All Categories", the search input automatically re-enables.

### Mutations: Optimistic Updates
DummyJSON is a mock prototyping API: any POST, PUT, or DELETE request returns mock success payloads but never persists data in their backend database.
- If we refetched the product list after an addition, edit, or deletion, our changes would disappear immediately and be replaced with static mock data.
- To provide a realistic, responsive user experience:
  - **Add Product:** Prepends the newly created product to local state and increments the total count by 1.
  - **Edit Product:** Replaces the modified product in local state by matching `id`.
  - **Delete Product:** Filters out the deleted item from local state and decrements the total count by 1.
- No secondary `GET` call is made after mutations, keeping the UI instantaneous and consistent.

### URL as Single Source of Truth
Storing `page`, `limit`, `q`, `category`, `sortBy`, and `order` directly in URL search parameters ensures:
- **Shareable state & bookmarking:** A team member can copy the exact dashboard URL with filters or pagination applied and see the exact same view.
- **Browser navigation support:** The browser's native Back and Forward buttons work without stale state or broken pagination.
- **State synchronization:** Local component state is eliminated for filter inputs, avoiding drift between the UI and query state. Values are safely parsed with defensive fallbacks (`Math.max(1, parseInt(page) || 1)`).

---

## 4. Problem I Faced + How I Fixed It

While wiring `useProducts.js`, I needed to test whether rapid search keystrokes would cause slower, earlier network requests to overwrite newer responses. To test this under real-world latency, I temporarily added `&delay=2000` to DummyJSON queries.

Sure enough, when typing "p", "ph", "pho", "phone" quickly:
1. The initial request for "p" was queued.
2. The final debounced request for "phone" completed in ~2000ms.
3. However, because each keystroke had initiated a delayed network request, the slow response for "p" finished slightly after "phone", clobbering the table with results for "p".

I introduced an `AbortController` in `useProducts.js` to cancel the previous in-flight request whenever parameters changed. But my first implementation introduced a new bug: when Axios threw `CanceledError`, it entered the regular `catch` block and treated the cancellation as a real network failure. This caused an error banner to flash on screen between every single keystroke.

To fix it, I updated the error handler:
```javascript
if (
  err.name === 'CanceledError' ||
  err.code === 'ERR_CANCELED' ||
  err.name === 'AbortError' ||
  controller.signal.aborted
) {
  // Gracefully ignore aborted requests without touching state or flashing errors
  return;
}
```
I also checked `if (controller.signal.aborted) return;` immediately before calling `setProducts()` in the resolution path. Re-running the delayed test confirmed that canceled requests cleanly dissolved in the background, leaving only the final query to update the table.

---

## 5. Where AI Helped Me

Here is an honest breakdown of where AI assisted me during this build:
- **Responsive table vs. card view structure (`src/components/products/ProductTable.jsx` & `ProductCard.jsx`):** AI helped scaffold the dual-view responsive layout, especially setting up the Tailwind breakpoint toggles (`hidden md:block` for the table and `grid md:hidden` for mobile cards) along with the striped row styling (`even:bg-gray-50/60`).
- **URL synchronization without render loops (`src/app/products/page.jsx`):** When synchronizing the debounced search input with `useSearchParams()` and `useTransition()`, AI helped write the URL parameter update helper that cleanly preserves existing query parameters while pruning empty values.
- **Writing self-contained inline SVG icons (`src/components/ui/Pagination.jsx`, `Navbar.jsx`, `DeleteModal.jsx`):** Because third-party icon libraries like `lucide-react` or `heroicons` were banned by the project specification, AI provided clean, accessible inline SVG icons for pagination chevrons, edit pencils, trash cans, star ratings, and the logout icon.
- **Form validation schema and double-submit guards (`src/components/products/ProductForm.jsx`):** AI provided the input validation logic for numerical constraints (price > 0, integer stock >= 0) and ensured the `isSubmitting` guard was placed at the very top of form handlers with a `finally` reset block.
