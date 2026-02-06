# BackstopJS Visual Regression Testing Setup

This folder contains everything needed to set up BackstopJS visual regression testing with GitHub Actions and GitHub Pages reporting.

## Files Included

```
backstopjs-setup/
├── .github/
│   └── workflows/
│       └── visual-regression.yml   # GitHub Actions workflow
├── backstop.json                    # BackstopJS configuration
├── gitignore-additions.txt          # Lines to add to your .gitignore
└── README.md                        # This file
```

## Setup Instructions

### 1. Copy Files to Your Project

```bash
# Copy the workflow file
mkdir -p .github/workflows
cp backstopjs-setup/.github/workflows/visual-regression.yml .github/workflows/

# Copy the BackstopJS config
cp backstopjs-setup/backstop.json ./
```

### 2. Update `.gitignore`

Add these lines to your `.gitignore`:

```
# BackstopJS visual regression testing
backstop_data/html_report/
backstop_data/bitmaps_test/
backstop_data/ci_report/
backstop_data/engine_scripts/
```

### 3. Configure `backstop.json`

Edit `backstop.json` and update:

1. **`id`**: Give your project a unique ID
2. **`scenarios`**: Update the URLs to match your environments:
   - `url`: Your staging/test environment
   - `referenceUrl`: Your production/live environment

Example:
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

### 4. Enable GitHub Pages

1. Go to your repo on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment", set **Source** to **GitHub Actions**

*Note: The workflow will attempt to enable this automatically, but manual setup may be required.*

### 5. Push and Run

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

Use `hideSelectors` or `removeSelectors` for dynamic content:

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

- `misMatchThreshold`: Percentage of pixels allowed to differ (default: 0.1%)
- `requireSameDimensions`: Fail if dimensions change (default: true)

## Troubleshooting

### Images not loading in GitHub Pages report
Make sure the workflow preserves the folder structure with `html_report/`, `bitmaps_reference/`, and `bitmaps_test/` at the same level.

### Tests always pass
If running `reference` and `test` in the same workflow without `referenceUrl`, you're comparing identical screenshots. Always use `referenceUrl` to compare different environments.

### Timeout errors
Increase the `delay` value for slow-loading pages, or add `readySelector` to wait for a specific element.

## Links

- [BackstopJS Documentation](https://github.com/garris/BackstopJS)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
