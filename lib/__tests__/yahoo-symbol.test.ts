import { describe, expect, it } from "vitest";
import { yahooSymbolCandidates } from "@/lib/yahoo-symbol";

describe("yahooSymbolCandidates", () => {
  it("keeps exchange suffixes and offers a hyphen only for a single-letter class", () => {
    expect(yahooSymbolCandidates("SAP.DE")).toEqual(["SAP.DE"]);
    expect(yahooSymbolCandidates("7203.T")).toEqual(["7203.T", "7203-T"]);
    expect(yahooSymbolCandidates("VOD.L")).toEqual(["VOD.L", "VOD-L"]);
    expect(yahooSymbolCandidates("BRK.B")).toEqual(["BRK.B", "BRK-B"]);
    expect(yahooSymbolCandidates("AAPL")).toEqual(["AAPL"]);
  });
});
