# UI repair — October 10, 2026

## Gucci reference direction

The homepage now uses a campaign hero, oversized serif BENICO wordmark,
minimal utility navigation, expandable collection menu, large editorial
sections, a spacious product selection, and a black footer. The storefront
uses a consistent light theme. Campaign assets come from the existing local
image library; higher-resolution original campaign photography is needed
for a sharper large-screen hero. Gucci's browser preview returned Access
Denied; the public page content was available through web retrieval.

Validation: production build passed with existing warnings; four frontend
tests passed, including menu open/close. Browser verified 390px and 1440px
layouts without horizontal overflow and with no broken homepage images.

## Completed

- Regenerate Tailwind CSS before frontend builds and development startup.
- Apply the chosen theme to the whole app and define readable content colors.
- Replace excessive wide-screen padding with a centered, bounded page shell.
- Keep gallery images at a consistent size, show the whole product, use direct
  image URLs, and label previous/next controls. Remove blob downloads and leaks.
- Keep the homepage navigation visible. Add a clear heading and responsive
  categories/product grid, loading feedback, and a loading error message.
- Use stable product keys and stop duplicating cards when catalog data changes.
- Replace the clipped footer with readable, responsive Persian navigation.
- Show products with no positive stock as unavailable, including negative stock.
- Disable unavailable product purchase buttons and label the size selector.
- Serve dashboard, search, and receipt paths directly through Django.
- Return product payloads with the correct JSON content type.

## Verification

- Frontend production build passed with remaining pre-existing lint/dependency warnings.
- Frontend: five tests passed (homepage availability, menu, persistent language switching, gallery navigation, gallery reset).
- Backend: two availability tests passed using a temporary test database.
- Browser verified homepage and product gallery, including next/previous controls.
- Homepage checked at 390px and 1440px with no horizontal overflow.
- Existing catalog data was preserved. No orders or payments were submitted.

## Next priorities

1. Validate stock and quantities in checkout, with transactions and payment completion.
2. Add actual product descriptions, fabric/care details, accurate size charts, and stock.
3. Standardize account/address forms, validation messages, and loading/error states.
4. Improve category artwork where the current database has no product images.
5. Finish password reset, search empty states, and payment receipts.
6. Consolidate API URLs and deployment settings; review local/GitHub migration differences.

The original LOCAL_SETUP.md records the first check before these repairs.
The storefront and custom admin baseline were pushed to GitHub as 7186560.

## Portfolio-inspired motion and language

- Burgundy and cream colors, serif wordmark and rounded interactive buttons.
- Self-hosted Vazirmatn, Manrope and Cormorant Garamond fonts with their OFL licenses.
- Continuous brand strip, hero parallax, scroll reveals, editorial tilt/zoom and product hover movement.
- Reduced-motion preferences disable movement and keep all sections visible.
- EN / فارسی switch updates interface copy, direction and prices immediately and persists in a cookie.
- Collection menu supports backdrop dismissal, Escape, focus return and keyboard focus containment.
- Desktop and 390px mobile browser checks passed with no horizontal overflow; English product page verified.
- Catalog titles, geographic address data and backend-generated messages retain their original content.

## Compact walkthrough and local administration

- Reduced hero height, wordmark, headings, buttons, product images and section spacing.
- Three chapter links with current-section indication; desktop wheel easing, native touch scrolling and reduced-motion support.
- Local `benico_admin` account: credentials in ignored `LOCAL_ADMIN_ACCESS.txt`; existing users preserved.
- Product administration includes inline image uploads/previews, available-stock labels, nonnegative stock validation and unique initial IDs.
- Order administration includes payment/date filters, customer search and order line inspection.
- Added clearly labeled sample IDs 8101, 8102 and 8103 with stock and existing local artwork. Five products total.
- Two existing orders remain unchanged, both unpaid. The admin account's customer order list starts empty; admin sees all orders.
- Checkout validates quantity, size and stock on the server, merges duplicate lines and rolls back failures atomically. It records unpaid orders and shows confirmation; no payment gateway is connected.
- Prevented the unconfigured reset-email endpoint from replacing account passwords before email delivery.
- Browser checked product selection, add/remove cart, checkout form, sample search, images, chapter links and responsive layout.
- Final production build succeeded; five frontend and seven backend tests passed. All eleven checked routes and all seven catalog image URLs returned HTTP 200.
- Admin login and product/order forms were checked through Django's client without entering credentials into browser UI. No additional orders or payments were submitted to the local database.

## Custom Benico admin panel

- `/admin/` now serves a custom React workspace with overview metrics, product editing/creation, stock controls, photo uploads, product search/category filters and searchable orders with payment filters and delivery details.
- Normal `/accounts/` login returns an authoritative staff role and redirect from the server. Staff go to `/admin/`; customers go to `/dashboard/detail/`. Existing signed-in staff are also routed to the panel from the account link.
- Management APIs use token authentication and require an active staff user on every endpoint; customer and anonymous access tests pass. UI cookies do not authorize the server.
- Prices are entered in toman and converted to the legacy database's thousand-toman units. Stock and price inputs are validated. Image files are validated and limited to 10 MB.
- Built-in Django admin moved to `/django-admin/` as an internal fallback; no storefront management link points there.
- Custom panel supports Persian/English, responsive layout, keyboard-accessible dialogs, save errors, empty states and sign-out.
- Production build passed with remaining legacy warnings; eight frontend and twelve backend tests passed.
- Browser verified real staff login/automatic redirect, product search and unchanged-value save, order filters and order details, both languages, and mobile layout. No orders, stock counts or payment states were changed by verification.

## Product page update

Gucci-inspired paired gallery, thumbnails, image zoom, size selection, stock-aware bag actions, detail accordions, and related pieces. Product description and materials/care fields are editable in the custom panel. Existing products retain their current stock and prices; missing information is clearly identified. Visual browser verification was blocked by the desktop browser policy; build and automated tests are checked.
