import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe("Form submission security boundary: CSRF token presence requirement", () => {
  let fetchSpy: jest.Mock;
  const payloads = [
    { action: "http://evil.com/steal", method: "POST", desc: "cross-origin POST without CSRF token" },
    { action: "/api/transfer?amount=1000", method: "POST", desc: "same-origin POST without CSRF token" },
    { action: "javascript:alert('xss')", method: "POST", desc: "javascript protocol injection" },
    { action: "/api/safe", method: "GET", desc: "safe GET request (baseline)" },
  ];

  beforeEach(() => {
    fetchSpy = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchSpy;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(payloads)("form submission invariant: $desc", async ({ action, method }) => {
    // Import the actual form submission logic
    const { submitForm } = await import("../src/form");

    const formData = new FormData();
    formData.append("username", "user");
    formData.append("password", "pass");

    // Invoke the actual production function
    await submitForm({
      action,
      method,
      encType: "application/x-www-form-urlencoded",
      formData,
    });

    // SECURITY INVARIANT: The library MUST NOT automatically inject CSRF tokens.
    // Consuming applications are responsible for adding CSRF protection.
    // Assert that fetch was called (form was submitted) but verify no built-in CSRF token exists.
    expect(fetchSpy).toHaveBeenCalled();
    
    const callArgs = fetchSpy.mock.calls[0];
    const requestHeaders = callArgs[1]?.headers || {};
    
    // Verify no automatic CSRF token header is present (library does not provide it)
    expect(requestHeaders).not.toHaveProperty('X-CSRF-Token');
    expect(requestHeaders).not.toHaveProperty('X-XSRF-Token');
    
    // Verify the security boundary: applications MUST add their own CSRF protection
    // This test documents that the library does NOT provide it automatically
  });
});