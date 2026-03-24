# BackstopJS Visual Regression Testing Setup

This folder contains everything needed to set up BackstopJS visual regression testing with GitHub Actions and GitHub Pages reporting.

## Files Included

```
backstopjs-setup/
├── .github/
│   └── workflows/
│       └── visual-regression.yml           # GitHub Actions workflow
├── backstop_data/
│   └── engine_scripts/
│       └── puppet/
│           └── login.js                    # Puppeteer login script (authenticated pages)
├── backstop.json                           # BackstopJS configuration
├── gitignore-additions.txt                 # Lines to add to your .gitignore
└── README.md                               # This file
```

## Setup Instructions

### 1. Copy Files to Your Project

```bash
# Copy the workflow file
mkdir -p .github/workflows
cp backstopjs-setup/.github/workflows/visual-regression.yml .github/workflows/

# Copy the BackstopJS config
cp backstopjs-setup/backstop.json ./

# Copy the login script (required for authenticated pages)
mkdir -p backstop_data/engine_scripts/puppet
cp backstopjs-setup/backstop_data/engine_scripts/puppet/login.js backstop_data/engine_scripts/puppet/
```

### 2. Update `.gitignore`

Add these lines to your `.gitignore`:

```
# BackstopJS visual regression testing
backstop_data/html_report/
backstop_data/bitmaps_test/
backstop_data/ci_report/
# Note: do NOT ignore engine_scripts/ — login.js must be tracked in source control
.env
```

### 3. Configure `backstop.json`

Edit `backstop.json` and update:

1. **`id`**: Give your project a unique ID
2. **`scenarios`**: Update the URLs to match your environments:
   - `url`: Your staging/test environment
   - `referenceUrl`: Your production/live environment

**Public page:**
```json
{
  "label": "Homepage",
  "url": "https://staging.yoursite.com/",
  "referenceUrl": "https://www.yoursite.com/",
  "delay": 500,
  "misMatchThreshold": 0.1,
  "requireSameDimensions": true
}
```

**Authenticated page** — add `"onBeforeScript"` to trigger the login before the screenshot:
```json
{
  "label": "Admin Content",
  "onBeforeScript": "puppet/login.js",
  "url": "https://staging.yoursite.com/admin/content",
  "referenceUrl": "https://www.yoursite.com/admin/content",
  "delay": 500,
  "misMatchThreshold": 0.1,
  "requireSameDimensions": true
}
```

### 4. Set Up Credentials for Authenticated Pages

The login script reads credentials from environment variables so they are never stored in the repository.

#### Running locally

```bash
BACKSTOP_USERNAME=myuser BACKSTOP_PASSWORD=mypass npx backstop test
```

Or create a `.env` file (never commit it — it is already gitignored):

```bash
# .env
BACKSTOP_USERNAME=myuser
BACKSTOP_PASSWORD=mypass
```

Then run with:

```bash
npx dotenv -e .env -- npx backstop test
```

#### Running in GitHub Actions

Add two secrets to your repository under **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `BACKSTOP_USERNAME` | your login username |
| `BACKSTOP_PASSWORD` | your login password |

The workflow passes these automatically to both the `reference` and `test` steps.

#### How the login script works

- The script (`backstop_data/engine_scripts/puppet/login.js`) navigates to `/user/login` on each environment, fills in the credentials, and submits the form.
- It logs into **both** the staging and production environments in every run, so reference and test screenshots are both captured while authenticated.
- After submitting, it verifies the login succeeded by checking the redirect URL. If login fails (wrong credentials, account doesn't exist on that environment), the workflow fails immediately with a clear error message rather than silently taking screenshots of an access-denied page.
- The login form selectors default to standard Drupal field names (`name`, `pass`, `data-drupal-selector="edit-submit"`). If your site uses different selectors, update them in `login.js`.

### 5. Enable GitHub Pages

1. Go to your repo on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment", set **Source** to **GitHub Actions**

*Note: The workflow will attempt to enable this automatically, but manual setup may be required.*

### 6. Push and Run

```bash
git add .
git commit -m "Add BackstopJS visual regression testing"
git push
```

The workflow runs on:
- Push to `main` branch
- Pull requests to `main`
- Manual trigger (Actions → Run workflow)

## Viewing Results

After the workflow runs:

- **GitHub Pages Report**: `https://<username>.github.io/<repo>/`
- **Downloadable Artifact**: Actions → Select run → Artifacts → `backstop-report`

## Configuration Options

### Add More Pages to Test

Add more objects to the `scenarios` array in `backstop.json`:

```json
{
  "label": "Contact Page",
  "url": "https://staging.yoursite.com/contact",
  "referenceUrl": "https://www.yoursite.com/contact",
  "delay": 500,
  "misMatchThreshold": 0.1,
  "requireSameDimensions": true
}
```

### Adjust Viewports

Modify the `viewports` array to test different screen sizes:

```json
"viewports": [
  { "label": "mobile", "width": 375, "height": 667 },
  { "label": "tablet", "width": 768, "height": 1024 },
  { "label": "desktop", "width": 1440, "height": 900 }
]
```

### Test Specific Elements

Add `selectors` to capture only certain elements:

```json
{
  "label": "Homepage Header",
  "url": "https://staging.yoursite.com/",
  "referenceUrl": "https://www.yoursite.com/",
  "selectors": [".header", ".navigation", "#hero"],
  "delay": 500
}
```

### Hide Dynamic Content

Use `hideSelectors` or `removeSelectors` for dynamic content that changes between runs:

```json
{
  "label": "Homepage",
  "url": "https://staging.yoursite.com/",
  "referenceUrl": "https://www.yoursite.com/",
  "hideSelectors": [".ad-banner", ".live-chat"],
  "removeSelectors": [".cookie-notice"],
  "delay": 500
}
```

### Adjust Sensitivity

- `misMatchThreshold`: Percentage of pixels allowed to differ (default: `0.1`)
- `requireSameDimensions`: Fail if page height changes (default: `true`)

## Troubleshooting

### Login fails — "Check your BACKSTOP_USERNAME and BACKSTOP_PASSWORD secrets"
The user account does not exist on that environment, or the password is wrong. Verify you can log in manually on both the staging and production URLs before running the tests.

### Login appears to succeed but the page shows access denied
The login script logs "Authenticated" only after confirming the browser was redirected away from `/user/login`. If you still see access denied in the screenshots, the user account likely lacks the required permissions on that environment.

### Images not loading in GitHub Pages report
Make sure the workflow preserves the folder structure with `html_report/`, `bitmaps_reference/`, and `bitmaps_test/` at the same level.

### Tests always pass
If both environments show the same page (e.g. both show an access-denied page), the screenshots will match and pass. Always verify the screenshots in the artifact report look like the actual pages you intended to test.

### Timeout errors
Increase the `delay` value for slow-loading pages, or add `readySelector` to wait for a specific element to appear before taking the screenshot.

## Links

- [BackstopJS Documentation](https://github.com/garris/BackstopJS)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
