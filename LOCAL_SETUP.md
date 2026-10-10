# Local setup and check results

Checked on October 10, 2026 using Python 3.12.10 and Node.js 24.21.0.

## GitHub connection

The local `main` branch tracks `origin/main` at
https://github.com/behrad00rad/benico_store.git.
The remote baseline is commit `38f0bb0`. Existing local source files were
preserved; there are substantial differences, including different Django
migration histories. Review these before committing or pushing. No changes
were pushed.

## Run the existing local storefront

From PowerShell in `D:\benico`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-runtime.txt
cd front
npm ci
npm run build
cd ..\benico
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:2000
```

Open http://127.0.0.1:2000/. Build the frontend before starting Django.
Restart Django after rebuilding if it cached an earlier missing template.
The frontend currently hardcodes this API address.

The provided SQLite database already has all local migrations applied.
It was not migrated or changed during these checks. For a fresh database,
run `manage.py migrate` first; product data and images must be supplied
separately. The minimal dependency file reproduces this check environment;
the old `requirement.txt` includes unrelated packages and omits DRF.

## Results

- Frontend production build: passed with lint and dependency warnings.
- Django system check: passed with one warning about `null` on a many-to-many field.
- Homepage, its JavaScript/CSS, catalog, recommendations, category-preview API,
  location API, and one product image: HTTP 200.
- Browser: homepage and product 7000 loaded, including size selection.
- Direct `/dashboard/`, `/search/`, and `/recipte/123/`: HTTP 404.
- Frontend test: failed because `window.matchMedia` is not mocked. The only
  test also still expects the starter application's "learn react" text.
- Backend test command: discovered zero tests.
- Existing catalog has two products. Product 7000 has inventory counts
  L=0, XL=-12, XXL=-4. The homepage advertises it for purchase while all
  sizes show unavailable. Cart/order submission could not be usefully
  exercised with this inventory; no order or payment was submitted.

## Next work

1. Review local versus remote changes and reconcile migration history.
2. Repair stock validation and availability display; test checkout using
   disposable data and a separate database.
3. Add Django routes for direct frontend navigation and real automated tests.
4. Finish password reset/payment behavior and prepare deployment settings.

The running server is for local development. This check does not establish
that authentication, checkout, payments, or deployment are ready.
