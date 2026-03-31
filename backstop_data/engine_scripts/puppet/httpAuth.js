/**
 * BackstopJS onBeforeScript — handles HTTP Basic Authentication for
 * Platform.sh environments that are protected by a site-level password prompt.
 *
 * Required environment variables:
 *   BACKSTOP_HTTP_USER  — HTTP Basic Auth username
 *   BACKSTOP_HTTP_PASS  — HTTP Basic Auth password
 */

module.exports = async (page, scenario, vp) => {
  const username = process.env.BACKSTOP_HTTP_USER || "";
  const password = process.env.BACKSTOP_HTTP_PASS || "";

  if (!username || !password) {
    throw new Error(
      "BACKSTOP_HTTP_USER and BACKSTOP_HTTP_PASS environment variables must be set."
    );
  }

  const encoded = Buffer.from(`${username}:${password}`).toString("base64");
  await page.setExtraHTTPHeaders({ Authorization: `Basic ${encoded}` });
};
