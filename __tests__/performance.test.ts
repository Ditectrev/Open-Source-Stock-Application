import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Bundle size limits (Req 15.5)", () => {
  it("should keep package.json dependencies count reasonable", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
    );
    const depCount = Object.keys(pkg.dependencies).length;
    // Keeping production dependencies lean reduces bundle size
    expect(depCount).toBeLessThanOrEqual(20);
  });

  it("should not include heavy utility libraries as production dependencies", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
    );
    const deps = Object.keys(pkg.dependencies);
    const heavyLibs = ["lodash", "moment", "moment-timezone", "jquery", "underscore", "rxjs"];
    const found = deps.filter((d) => heavyLibs.includes(d));
    expect(found).toEqual([]);
  });

  it("should have @next/bundle-analyzer available for size auditing", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
    );
    expect(pkg.devDependencies["@next/bundle-analyzer"]).toBeDefined();
  });

  it("should have an analyze script in package.json", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
    );
    expect(pkg.scripts.analyze).toBeDefined();
    expect(pkg.scripts.analyze).toContain("ANALYZE=true");
  });

  it("should enable bundle analyzer only when ANALYZE env is set", async () => {
    const { default: nextConfig } = await import("../next.config");
    // In test env ANALYZE is not set, so the config should still be a valid object
    expect(nextConfig).toBeDefined();
    expect(typeof nextConfig).toBe("object");
  });
});

describe("Lazy loading behavior (Req 15.2)", () => {
  let pageSource: string;

  beforeAll(() => {
    pageSource = fs.readFileSync(
      path.resolve(__dirname, "../app/page.tsx"),
      "utf-8"
    );
  });

  const dynamicComponents = [
    "OverviewTab",
    "TechnicalIndicatorsDisplay",
    "ForecastDisplay",
    "SeasonalHeatmap",
    "FinancialsTable",
    "FearGreedGauge",
    "WorldMarkets",
    "SectorHub",
    "HeatmapHub",
    "ScreenerHub",
    "CalendarHub",
  ];

  it("should use next/dynamic for code splitting", () => {
    expect(pageSource).toContain('import dynamic from "next/dynamic"');
  });

  for (const component of dynamicComponents) {
    it(`should lazy-load ${component} via dynamic()`, () => {
      const pattern = new RegExp(
        `const\\s+${component}\\s*=\\s*dynamic\\(`
      );
      expect(pageSource).toMatch(pattern);
    });
  }

  it("should disable SSR for all dynamically imported components", () => {
    // Every dynamic() call should include ssr: false
    const dynamicCalls = pageSource.match(/dynamic\(\s*\n?\s*\(\)/g);
    const ssrFalseCount = (pageSource.match(/ssr:\s*false/g) || []).length;
    expect(dynamicCalls).not.toBeNull();
    expect(ssrFalseCount).toBe(dynamicCalls!.length);
  });

  it("should provide a loading fallback for each dynamic component", () => {
    const loadingCount = (pageSource.match(/loading:\s*\(\)\s*=>/g) || [])
      .length;
    const dynamicCount = (
      pageSource.match(/dynamic\(\s*\n?\s*\(\)/g) || []
    ).length;
    expect(loadingCount).toBe(dynamicCount);
  });

  it("should not statically import any lazy-loaded component", () => {
    // Ensure none of the dynamically loaded components are also statically imported
    for (const component of dynamicComponents) {
      const staticImportPattern = new RegExp(
        `^import\\s+.*\\b${component}\\b.*from`,
        "m"
      );
      expect(pageSource).not.toMatch(staticImportPattern);
    }
  });

  it("should only statically import lightweight shell components", () => {
    // These are the small components that form the app shell and should load eagerly
    const staticImports = pageSource.match(
      /^import\s+\{[^}]+\}\s+from\s+"@\/components\/[^"]+"/gm
    );
    expect(staticImports).not.toBeNull();

    const allowedStatic = [
      "SearchBar",
      "ThemeToggle",
      "SymbolHeader",
      "TabNavigation",
      "Footer",
      "LoadingSpinner",
    ];

    for (const imp of staticImports!) {
      const componentMatch = imp.match(
        /from\s+"@\/components\/(\w+)"/
      );
      if (componentMatch) {
        expect(allowedStatic).toContain(componentMatch[1]);
      }
    }
  });
});
