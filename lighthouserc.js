/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      // Use the Next.js production build
      startServerCommand: "bun run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      url: ["http://localhost:3000"],
      numberOfRuns: 3,
      settings: {
        // Simulate a typical user device
        preset: "desktop",
        // Skip audits that require network conditions we can't control in CI
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.7 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
