/**
 * BackstopJS onBeforeScript — authenticates the browser session before
 * a screenshot is taken.
 *
 * Credentials are read from environment variables so they are never
 * committed to source control:
 *
 *   BACKSTOP_USERNAME=myuser BACKSTOP_PASSWORD=mypass npx backstop test
 *
 * The login URL is derived automatically from the scenario URL so the same
 * script works for both the staging and main environments.
 */

module.exports = async (page, scenario, vp) => {
  // Derive the login URL from whichever site is currently being captured
  // (staging for test runs, main for reference runs) so the same script
  // works for both without any extra configuration.
  const origin = new URL(scenario.url).origin;
  const loginUrl = `${origin}/user/login`;

  const username = process.env.BACKSTOP_USERNAME || "";
  const password = process.env.BACKSTOP_PASSWORD || "";

  if (!username || !password) {
    throw new Error(
      "BACKSTOP_USERNAME and BACKSTOP_PASSWORD environment variables must be set."
    );
  }

  // Navigate to the login page
  await page.goto(loginUrl, { waitUntil: "networkidle0" });

  // Fill in credentials.
  // Update the selectors below to match your site's login form.
  await page.type('[name="name"]', username);
  await page.type('[name="pass"]', password);

  // Click the submit button and wait for navigation to complete
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('[data-drupal-selector="edit-submit"]'),
  ]);

  console.log(`[login.js] Authenticated as "${username}" on ${loginUrl}`);
};
