/**
 * BackstopJS onBeforeScript — authenticates the browser session before
 * a screenshot is taken.
 *
 * Credentials are read from environment variables so they are never
 * committed to source control:
 *
 *   BACKSTOP_HTTP_USER=httpuser BACKSTOP_HTTP_PASS=httppass \
 *   BACKSTOP_USERNAME=myuser BACKSTOP_PASSWORD=mypass npx backstop test
 *
 * BACKSTOP_HTTP_USER / BACKSTOP_HTTP_PASS handle the Platform.sh HTTP Basic
 * Auth prompt. BACKSTOP_USERNAME / BACKSTOP_PASSWORD handle the Drupal login.
 *
 * The login URL is derived automatically from the scenario URL so the same
 * script works for both the staging and main environments.
 */

module.exports = async (page, scenario, vp) => {
  const httpUser = process.env.BACKSTOP_HTTP_USER || "";
  const httpPass = process.env.BACKSTOP_HTTP_PASS || "";

  if (httpUser && httpPass) {
    const encoded = Buffer.from(`${httpUser}:${httpPass}`).toString("base64");
    await page.setExtraHTTPHeaders({ Authorization: `Basic ${encoded}` });
  }

  const username = process.env.BACKSTOP_USERNAME || "";
  const password = process.env.BACKSTOP_PASSWORD || "";

  if (!username || !password) {
    throw new Error(
      "BACKSTOP_USERNAME and BACKSTOP_PASSWORD environment variables must be set."
    );
  }

  // Log into every unique origin in this scenario (both url and referenceUrl).
  // Puppeteer stores cookies per-domain, so logging into site B does not clear
  // site A's session — both sets of cookies are preserved. This ensures the
  // authenticated page loads correctly whether BackstopJS is capturing the test
  // screenshots (url) or the reference screenshots (referenceUrl).
  const origins = [
    ...new Set(
      [scenario.url, scenario.referenceUrl]
        .filter(Boolean)
        .map((u) => new URL(u).origin)
    ),
  ];

  for (const origin of origins) {
    const loginUrl = `${origin}/user/login`;

    await page.goto(loginUrl, { waitUntil: "networkidle0" });
    await page.type('[name="name"]', username);
    await page.type('[name="pass"]', password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click('[data-drupal-selector="edit-submit"]'),
    ]);

    // Verify login actually succeeded — Drupal stays on /user/login if it fails
    const finalUrl = page.url();
    if (finalUrl.includes("/user/login")) {
      const errorText = await page
        .$eval(".messages--error", (el) => el.textContent.trim())
        .catch(() => "Check your BACKSTOP_USERNAME and BACKSTOP_PASSWORD secrets.");
      throw new Error(`[login.js] Login FAILED for ${origin}: ${errorText}`);
    }

    console.log(`[login.js] Authenticated as "${username}" on ${loginUrl} → redirected to ${finalUrl}`);
  }
};
