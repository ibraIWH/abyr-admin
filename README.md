# Abyr Line — Admin

A standalone admin dashboard for your store. It talks to the **same backend** as your
web storefront and iOS app (`https://abbayah-backend.onrender.com/api`), so anything you
change here shows up everywhere. Built with **Vite + React**, no Tailwind — just clean CSS.

You can manage:

- **Products** — add / edit / delete, set sizes, colors, tag (Best Seller / Selling Fast)
- **Discounts** — set or remove a sale price in one click
- **Collections** — the “Shop by Collection” tiles
- **Offers** — promo banners
- **Home & Banner** — the home hero + the free-delivery news strip
- **Orders** — view details and update status

Images are set by URL for now. **Phase 3** swaps in real device upload (Cloudinary) — see the end.

---

## 0. Prerequisites

- **Node 20.19+ or 22+** — check with `node -v`. (Vite 8 needs a modern Node.)
- An **admin account**. The admin app only lets admins in. If you don’t have one yet:
  1. Register a normal account in the app or on the web (so it exists in the database).
  2. In your **backend** project, promote it to admin (you added this script in Phase 1):
     ```bash
     cd ~/Desktop/abbayah-backend
     node src/makeAdmin.js you@example.com
     ```
     You should see `✓ you@example.com is now an admin`.

---

## 1. Create the app (npm + Vite 8)

Open the VS Code terminal and run these one by one:

```bash
cd ~/Desktop
npm create vite@latest abyr-admin -- --template react
cd abyr-admin
npm install
npm install react-router-dom axios
```

To pin Vite to the version you asked for:

```bash
npm install -D vite@8.0.11
```

> If npm says that exact version isn’t available, use `npm install -D vite@^8.0.0` instead —
> any 8.x works. Confirm with `npx vite --version`.

---

## 2. Drop in the project files

From the files I gave you (`abyr-admin/`), replace the scaffold with the real app:

1. **Delete** the generated `src` folder completely.
2. **Copy in** the provided `src` folder (it already contains `main.jsx`, `App.jsx`,
   `index.css`, `theme.js`, `api.js`, and the `context/`, `components/`, `pages/` folders).
3. **Replace** `index.html` and `vite.config.js` with the provided ones.

Your folder should now look like this:

```
abyr-admin/
├── index.html
├── vite.config.js
├── .env                ← you create this in step 3
├── package.json        ← from the scaffold (keep it)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── theme.js
    ├── api.js
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ToastContext.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── Modal.jsx
    │   ├── ImageField.jsx
    │   ├── Icons.jsx
    │   └── ui.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── ProductsPage.jsx
        ├── CollectionsPage.jsx
        ├── OffersPage.jsx
        ├── HomeContentPage.jsx
        └── OrdersPage.jsx
```

---

## 3. Point it at your backend

Copy the example env file and keep the default (the deployed backend):

```bash
cp .env.example .env
```

`.env` contains:

```
VITE_API_BASE=https://abbayah-backend.onrender.com/api
```

If you’re running the backend locally instead, set it to `http://localhost:5000/api`.

---

## 4. Run it

```bash
npm run dev
```

It opens **http://localhost:5174** (a different port from the storefront’s 5173, so you can
run both at once). Sign in with your admin email and password.

To build for production later: `npm run build`, then `npm run preview` to test the build.

---

## What’s next

- **Phase 3 — Device image upload.** Right now you paste an image URL. Next we wire the
  “Choose from device” button to upload straight from your phone/computer to Cloudinary
  (free tier) and save the link automatically. This needs your Cloudinary cloud name + keys,
  and a small signed-upload endpoint on the backend. Every image field upgrades at once.
- **Phase 4 — Show it on the storefront.** The backend + admin let you *manage* the home
  hero, collections, offers, and news banner. The web and iOS home screens still need to be
  wired to *fetch* `/settings`, `/collections`, and `/offers` so your changes actually appear.

---

## Troubleshooting

- **“This account is not an admin.”** Run the `makeAdmin.js` step in section 0, then sign in again.
- **Login does nothing / network error.** Check `.env` points at a backend that’s running.
  The Render backend can take ~30s to wake up on the first request.
- **CORS error in the browser console.** Your backend already serves the web storefront from a
  browser, so localhost should be allowed. If you do hit CORS, make sure the backend uses
  `app.use(cors())` (open) in development, or add `http://localhost:5174` to its allowed origins.
- **Blank page after sign-in.** Hard-refresh once (the token is stored in your browser as
  `abyr_admin_token`). Signing out clears it.
