# 🎬 Full Screencast Script — Mohamad's MediCore Pharmacy

> **Purpose**: Walk through every feature for your professor  
> **Total time**: ~12–15 minutes  
> **Voice**: Speak clearly and slowly. Explain what you're doing and why.  
> **Preparation before recording**: Open Chrome, go to `http://localhost:3000`, clear site data, sign out if already signed in. Maximize the window.

---

## PART 1 — HOMEPAGE OVERVIEW (0:00 – 1:30)

**You see**: The homepage of Mohamad's MediCore Pharmacy.

**Say**: "Welcome to Mohamad's MediCore Pharmacy, a full-stack online pharmacy web application built with React, TypeScript, Supabase, and TanStack Router."

**Action**: Slowly scroll the page from top to bottom.

**1. Announcement Banner** (top of page, colored strip)
- **Say**: "At the very top, there is an announcement banner. Admins can change this text from the dashboard settings."

**2. Navbar**
- **Say**: "The navigation bar has links to Home, Medicines, About, FAQ, Contact, and Orders. On the right side there is a language toggle (DE/EN), a search icon, a theme toggle (sun/moon for dark/light mode), the cart icon with a badge showing the item count, and a Sign-in button."

**3. Hero Section**
- **Say**: "Below the navbar is the hero section with a badge 'Your pharmacy · online & on-site', the main heading 'Order medicines with confidence', a subtitle, and two call-to-action buttons: 'Browse medicines' and 'Upload prescription'."

**4. Trust Cards** (3 cards in a row)
- **Say**: "Three trust cards show: Registered Pharmacy, Fast Delivery, and Pharmacist Support. Each has an icon, a title, and a short description."

**5. Prescription Upload Widget (ERezeptScanner)**
- **Say**: "The E-Rezept scanner lets you drag and drop or click to upload a prescription file (PNG, JPG, PDF). This is also available during checkout."

**6. Category Cards** (4 cards)
- **Say**: "Category cards let you browse by category. There are 4: Pain & Fever, Cold & Flu, Mother & Baby, and Skin & Wound Care."
- **Action**: Click one category card (e.g., "Pain & Fever"). This navigates to `/medications?category=Pain & Fever`.

**7. Featured Medicines Section**
- **Say**: "The featured medicines section shows all available products. Each card shows the medication name, image, price, stock count, and an 'Add' button."

**8. Footer**
- **Say**: "The footer contains company info, quick links to legal pages (Privacy Policy, Terms & Conditions, Right of Withdrawal), opening hours, and contact details."

---

## PART 2 — BROWSE MEDICATIONS & SEARCH (1:30 – 2:30)

**Action**: Click **"Medicines"** in the navbar or click **"Browse medicines"** button.

**You see**: `/medications` — the full medications catalog page.

**Say**: "This is the full medications catalog page. The URL is `/medications`."

**Action**: Type in the search box (e.g., "Aspirin").
- **Say**: "The search box filters medications in real time as you type. Try searching for 'Aspirin' or any keyword."

**Action**: Click a category pill button (e.g., "Pain & Fever").
- **Say**: "Category filter pills let you narrow down by category. Click 'All' to reset."

**Action**: Click **"Add"** on a medication card.
- **Say**: "The 'Add' button adds one unit to the cart and immediately reserves the stock in the database. Watch the stock count on the card go down."

**Action**: Click on a medication card image or name to navigate to the detail page.

**You see**: `/medications/{id}` — product detail page.

**Say**: "Each medication has its own detail page showing the full description, price, stock, side effects, dosage, and a larger 'Add to Cart' button. Click 'Back to medicines' to go back."

---

## PART 3 — ADD TO CART + LIVE STOCK SYNC (2:30 – 5:00)

**Say**: "Now I will demonstrate the real-time stock reservation system. When you add an item, stock is decremented in the database immediately."

**Action**: Go back to `/medications`. Find any medication (e.g., "Amoxicillin 500mg"). Notice the stock number (e.g., 58).

**Action**: Click **"Add"** on Amoxicillin 500mg.
- **Say**: "Watch the stock number decrease from 58 to 57. This change happens in the database instantly via a server function."
- **Show** the toast: "Amoxicillin 500mg added to cart"

**Action**: Click the **cart icon** in the navbar (top right).
- **You see**: Cart drawer slides in from the right.
- **Say**: "The cart drawer shows all items with quantity controls, individual prices, and a total. Click outside the drawer or the X button to close it."

**Action**: Add another medication (e.g., "Aspirin 500mg").
- **Say**: "Add another item. Notice the cart badge in the navbar updates to show 2 items."

**Action**: Open the cart drawer again. Click the **"−" (decrease)** button on one item.
- **Say**: "When you decrease the quantity, the stock is released back to the database. For example, decreasing from 1 to 0 releases 1 unit of stock."

**Action**: Click **"+" (increase)** on an item.
- **Say**: "Increasing the quantity reserves additional stock, provided enough is available."

**Action**: Click the **trash icon** (remove) on one item.
- **Say**: "The trash button removes the item entirely and releases all its reserved stock."

**Action**: Click **"View cart"** inside the cart drawer to go to the full cart page.

**You see**: `/cart` — the full cart page.

**Say**: "The cart page has the same controls in a wider layout. Quantity controls, remove buttons, item images, and an order summary card on the right showing subtotal and estimated delivery."

**Action**: Refresh the browser (F5).
- **Say**: "The cart is persisted in the browser's localStorage. Refreshing the page keeps the items."

---

## PART 4 — LOGIN / SIGN UP WITH DEMO USERS (5:00 – 7:00)

**Action**: Click **"Sign in"** in the navbar.

**You see**: `/login` — the login page.

**Say**: "The login page has three sections. On the left, demo user buttons for quick testing. On the right, the standard email/password form with a link to sign up."

**Action**: Point to the **"Demo users"** section.
- **Say**: "There are three demo accounts: Admin (admin@medicore.com / Admin123!), Patient (patient@medicore.com / Patient123!), and Pharmacist (pharmacist@medicore.com / Pharmacist123!). Clicking any button auto-fills the form."

**Action**: Click the **"Patient"** demo button (the blue one).
- **Say**: "Clicking 'Patient' fills in patient@medicore.com and Patient123!."

**Action**: Click **"Sign in with demo account"** (below the form).
- **You see**: Toast "Signed in as patient" and you are redirected to the homepage.
- **Say**: "You are now signed in as a patient. The navbar changes — it now shows the user's name and email, and there is no longer a 'Sign in' button."

**Action**: Move your mouse over the user avatar/name in the navbar.
- **Say**: "Clicking the user name shows a dropdown with 'My orders', 'Profile', and 'Sign out'."

**Action**: Click **"Profile"** from the dropdown (or go to `/profile`).

**You see**: `/profile` — the profile page.

**Say**: "The profile page lets users edit their personal information: first name, last name, phone, street, city, and postcode. This information auto-fills during checkout."

**Action**: Edit a field (e.g., change the city), then click **"Save changes"**.
- **Say**: "Click 'Save changes'. The data is saved to the database via a server function."
- **Show** the toast: "Profile updated"

---

## PART 5 — CHECKOUT FLOW (7:00 – 9:00)

**Action**: Click **"Medicines"** → add a couple items to cart → click **"View cart"** → click **"Checkout"**.

**You see**: `/checkout` — the checkout page.

**Say**: "The checkout page has a form on the left and an order summary on the right."

**Action**: Point to the **Delivery method** radio buttons.
- **Say**: "Choose 'Pickup (free)' or 'Home delivery' which costs a fee."
- **Action**: Select **"Home delivery"**.
- **Say**: "When you select delivery, address fields appear. These are pre-filled from your profile."

**Action**: Type in the street, city, and postcode if they are empty.

**Action**: Add a note in the **Notes** textarea (e.g., "Leave with neighbor").

**Action**: If any items require a prescription (e.g., Amoxicillin), a **Prescription card** appears.
- **Say**: "Prescription-required items show a prescription upload card. You can upload a JPG, PNG, or PDF file (max 5MB)."
- **Action**: Click **"Use demo prescription"** toggle (if using a demo account).
- **Say**: "For demo purposes, you can use a demo prescription file."

**Action**: Click **"Place order"**.
- **Say**: "The server validates that all items are still in stock, creates the order, inserts the items, clears the cart, and redirects to the order detail page."
- **You see**: Redirect to `/orders/{id}` with toast "Order placed!"

**You see**: The **order detail page**.
- **Say**: "The order detail page shows the order number, items table, delivery information, and a status timeline on the right showing 'Order received' as the current step."

---

## PART 6 — ORDERS LIST + CANCEL + DELETE (9:00 – 10:30)

**Action**: Click **"Orders"** in the navbar (or go to `/orders`).

**You see**: `/orders` — the orders list page.

**Say**: "This page lists all your orders. Each card shows the order ID, date, item count, delivery method, status badge, total price, and action buttons."

**Action**: Click **"View"** on a pending order.
- **Say**: "Click 'View' to see the full order detail page."

**You see**: The order detail page again (from PART 5).

**Action**: Click **"Cancel order"** (red button).
- **Say**: "Only pending orders can be cancelled."
- **Browser confirm dialog**: Click **OK**.
- **Say**: "When you cancel, the status changes to 'Cancelled' with a red X icon, and all reserved stock is released back to the database."
- **Show** the toast: "Order cancelled"

**Action**: Now click **"Delete order"** (appears when status is cancelled).
- **Browser confirm dialog**: Click **OK**.
- **Say**: "Deleting removes the order permanently from the database."
- **Show** redirect to `/orders` with toast "Order deleted"

---

## PART 7 — EDIT ORDER (NEW FEATURE) (10:30 – 12:00)

**Say**: "Now I will demonstrate the new Edit Order feature. This lets you modify a pending order."

**Action**: Go to `/medications`, add 2–3 items to the cart. Then go through checkout to place a new pending order.

**Say**: "First, place a new order so we have a pending order to edit."

**Action**: After the order is placed, go to `/orders` and click **"Edit"** on the pending order (or go to the detail page and click **"Edit order"**).

**Say**: "The 'Edit order' button copies all items from the order into the cart with current prices and stock, then navigates to the checkout page."

**You see**: Redirected to `/checkout?editOrderId={id}`.

**Say**: "Notice the URL has `?editOrderId=...` and the heading now says 'Edit order' instead of 'Checkout'. The button at the bottom says 'Update order' instead of 'Place order'."

**Action**: Change the quantity of an item (either in the cart or go to `/medications` and add/remove items, then come back to checkout).
- **Say**: "You can increase or decrease quantities, add new items, or remove existing ones."

**Action**: Click **"Update order"**.
- **Say**: "The server compares old and new items. For newly added items, stock is reserved. For removed items, stock is released. For changed quantities, stock is adjusted accordingly."
- **Show** toast: "Order updated!"
- **You see**: Redirect to `/orders/{id}` with the updated items and new total price.

---

## PART 8 — ADMIN DASHBOARD (12:00 – 14:30)

**Action**: Click the user avatar → **"Sign out"**. Then on the login page, click the **"Admin"** demo button (red), then **"Sign in with demo account"**.

**Say**: "Sign in as Admin to access the dashboard."

**Action**: Click **"Dashboard"** in the navbar (appears when logged in as staff).

**You see**: `/admin` — the admin dashboard with tabs.

**Say**: "The admin dashboard has five tabs: Orders, Medications, Users, Settings, and Contact. The Users tab only appears for admin-level accounts."

### TAB 1 — Orders
**Action**: Click the **"Orders"** tab if not already selected.
- **Say**: "The Orders tab shows all customer orders with a status filter dropdown, a paginated table, and an inline status selector. Admins can change order status here."
- **Action**: Change a status from "pending" to "confirmed" using the dropdown.
- **Say**: "Statuses progress through: pending → confirmed → in_preparation → ready → completed."

### TAB 2 — Medications
**Action**: Click the **"Medications"** tab.
- **Say**: "The Medications tab shows the full product catalog with search, stock counts, prices, and active status."
- **Action**: Click **"Add medication"** → show the dialog with fields: name, description, category, price, stock, requires_prescription toggle, image URL, active toggle.
- **Say**: "Click 'Add medication' to open the dialog. Fill in the details and click 'Save' to create a new product."
- **Action**: Click the **edit (pencil) icon** on an existing medication.
- **Say**: "You can edit any medication inline."
- **Action**: Toggle the **"Active"** switch on a medication.
- **Say**: "Toggle 'Active' to show or hide a product from customers."

### TAB 3 — Users
**Action**: Click the **"Users"** tab.
- **Say**: "The Users tab lists all registered users with their email, role, and status. This tab is only available to admin-level accounts."

### TAB 4 — Settings
**Action**: Click the **"Settings"** tab.
- **Say**: "The Settings tab has five sections:"

**Scrolling down slowly**:
1. **Opening hours** — editable for each day of the week: open time, close time, and a "Closed" toggle for days off.
2. **Low stock alerts** — a toggle to enable/disable alerts, plus a threshold number (e.g., alert when stock is below 10).
3. **Shipping configuration** — delivery fee amount, free shipping minimum order value, estimated delivery days.
4. **Announcement banner** — enable/disable toggle, text content field, and color/style selection (info, warning, success, destructive).
5. **Auto-confirm orders** — a toggle that, when enabled, automatically confirms pending orders.

- **Say**: "All settings are saved to the database and affect the live site immediately."
- **Action**: Change the announcement banner text and enable it → click **Save**.
- **Action**: Go back to the homepage to show the banner updated live.

### TAB 5 — Contact
**Action**: Click the **"Contact"** tab.
- **Say**: "The Contact tab shows messages submitted through the contact form. Each message shows the name, email, subject, date, and a preview. Click to expand and read the full message."

---

## PART 9 — LANGUAGE SWITCHER (14:30 – 15:00)

**Action**: Click **"DE"** in the navbar language toggle.
- **Say**: "Clicking 'DE' switches the entire interface to German. All visible text labels change."
- **Action**: Scroll through a page to show the translation.
- **Action**: Click **"EN"** to switch back to English.
- **Say**: "Click 'EN' to switch back to English."

---

## PART 10 — DARK MODE (15:00 – 15:15)

**Action**: Click the **theme toggle** icon (sun/moon) in the navbar.
- **Say**: "The theme toggle switches between light and dark mode. All components respect the theme."
- **Action**: Click again to switch back.

---

## PART 11 — ADDITIONAL PAGES (15:15 – 16:30)

**Action**: Go to **About** (`/about`).
- **Say**: "The About page has a hero section, our story, trust features, and a team section."

**Action**: Go to **FAQ** (`/faq`).
- **Say**: "The FAQ page has expandable accordion items with common questions and answers."

**Action**: Go to **Contact** (`/contact`).
- **Say**: "The Contact page has a map, contact details, opening hours, and a contact form with name, email, subject, and message fields."
- **Action**: Fill in the form and click **"Send message"**.
- **Say**: "Messages go to the admin dashboard's Contact tab."

**Action**: Go to **Privacy Policy** (`/privacy`).
- **Say**: "The Privacy Policy page covers data collection, cookies, your rights, and contact information. Legally required for a German online pharmacy."

**Action**: Go to **Terms & Conditions** (`/terms`).
- **Say**: "Terms and conditions page with registration terms, ordering rules, delivery, payment, and liability."

**Action**: Go to **Right of Withdrawal** (`/withdrawal`).
- **Say**: "The withdrawal policy page with the model withdrawal form, instructions, and the withdrawal period information."

---

## PART 12 — MOBILE RESPONSIVENESS (16:30 – 17:00)

**Action**: Press **F12** to open Developer Tools → click the **mobile icon** (toggle device toolbar) → select a mobile device (e.g., iPhone 12 or Pixel 5).
- **Say**: "The website is fully responsive. On mobile, the layout adapts to smaller screens."
- **Action**: Show the **hamburger menu** (three lines) replacing the navbar links. Click it to show the menu.
- **Action**: Scroll the homepage on mobile to show the single-column layout.
- **Action**: Go to the medications page to show the grid becomes a single column.
- **Action**: Go to the cart page to show it stacks vertically.
- **Say**: "All pages, including checkout and the admin dashboard, are fully responsive."

---

## PART 13 — CLOSING (17:00)

**Say**: "This concludes the walkthrough of Mohamad's MediCore Pharmacy. The application features secure authentication, real-time stock management, prescription upload, order management with edit functionality, admin controls, role-based access control, language switching, dark mode, and a fully responsive design. Thank you for watching."

**Action**: Stop the recording.

---

## ✅ CHECKLIST — What the Professor Will Look For

| Feature | Where It Appears |
|---|---|
| Announcement banner (editable by admin) | Homepage top + Admin Settings |
| Hero section with CTA buttons | Homepage |
| Trust cards | Homepage |
| Prescription upload widget | Homepage + Checkout |
| Category cards | Homepage |
| Product catalog with search + filter | `/medications` |
| Product detail page | `/medications/{id}` |
| Add to cart with stock decrement | Product cards + detail page |
| Live stock sync (30s interval + focus) | Everywhere with stock display |
| Cart drawer | Click cart icon in navbar |
| Cart page with quantity controls | `/cart` |
| Cart persistence (localStorage) | Refresh any page |
| Login page with demo users | `/login` |
| Sign up page | Link on login page |
| Password reset | `/login` form |
| Profile editing | `/profile` |
| Checkout (pickup + delivery) | `/checkout` |
| Prescription upload during checkout | `/checkout` |
| Demo prescription toggle | `/checkout` (for demo accounts) |
| Place order with validation | `/checkout` |
| Order detail with status timeline | `/orders/{id}` |
| Order list with actions | `/orders` |
| Cancel order + stock release | `/orders/{id}` → Cancel |
| Delete order (permanent) | `/orders/{id}` → Delete |
| **Edit order** (NEW FEATURE) | `/orders` → Edit or `/orders/{id}` → Edit order |
| Admin dashboard (5 tabs) | `/admin` |
| Admin Orders tab (status management) | Admin → Orders |
| Admin Medications tab (CRUD) | Admin → Medications |
| Admin Users tab | Admin → Users |
| Admin Settings tab | Admin → Settings |
| Admin Contact tab | Admin → Contact |
| Admin opening hours | Settings tab |
| Low stock alerts | Settings tab |
| Shipping config | Settings tab |
| Announcement banner editor | Settings tab |
| Auto-confirm orders | Settings tab |
| Language switcher (DE/EN) | Navbar |
| Dark/light mode toggle | Navbar |
| About page | `/about` |
| FAQ page | `/faq` |
| Contact form | `/contact` |
| Privacy Policy | `/privacy` |
| Terms & Conditions | `/terms` |
| Right of Withdrawal | `/withdrawal` |
| Mobile responsive | Device toolbar in F12 |
| Footer with links + hours + contact | Every page bottom |

---

## 🎥 Recording Tips

- **OBS Studio** (free, open source): Record at 1920×1080, 30 fps
- **Audio**: Use a good microphone. Speak clearly, not too fast.
- **Mouse**: Keep the cursor visible and move it smoothly.
- **URL bar**: Keep it visible so the professor knows which page you are on.
- **No errors**: If a toast error appears, you can pause and re-record that segment.
- **Zoom in**: Use Windows Magnifier (Win+Plus) or browser zoom (Ctrl+Plus) to make text larger.
- **Demo accounts**: Use the demo user buttons — no need to type credentials manually.
- **Edit Order**: Make sure to show this prominently — it is the newest feature.
- **Final tip**: Practice the full walkthrough once before recording. It will help you speak naturally.
