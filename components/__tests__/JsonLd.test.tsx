import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("escapes script-breaking payloads before injecting JSON-LD", () => {
    const payload = {
      title: '</script><script>alert("owned")</script>',
      summary: "<b>Breaking headline</b>",
      source: "Wire & Feed",
    };

    const { container } = render(<JsonLd data={payload} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();

    const content = script?.innerHTML ?? "";
    expect(content).toContain(
      "\\u003c/script\\u003e\\u003cscript\\u003ealert(\\\"owned\\\")\\u003c/script\\u003e"
    );
    expect(content).toContain("\\u003cb\\u003eBreaking headline\\u003c/b\\u003e");
    expect(content).toContain("Wire \\u0026 Feed");
    expect(content).not.toContain("</script>");
  });
});
