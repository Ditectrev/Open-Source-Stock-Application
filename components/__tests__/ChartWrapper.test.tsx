import { describe, expect, it } from "vitest";
import { getDefaultChartOptions } from "@/components/ChartWrapper";

describe("getDefaultChartOptions", () => {
  it("keeps pan/zoom inside the data window", () => {
    const options = getDefaultChartOptions(800, 400, true);

    expect(options.timeScale).toMatchObject({
      fixLeftEdge: true,
      fixRightEdge: true,
      rightOffset: 0,
    });
    expect(options.handleScroll).toMatchObject({
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    });
    expect(options.kineticScroll).toEqual({
      mouse: false,
      touch: false,
    });
  });
});
