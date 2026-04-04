import { describe, expect, it } from "vitest";

import { calculateOutstandingBalance, formatTry } from "@/lib/finance";

describe("finance helpers", () => {
  it("calculates remaining balance from charges and payments", () => {
    expect(
      calculateOutstandingBalance([
        { amount: 4800, paid: 4800 },
        { amount: 6250, paid: 3200 },
        { amount: 850, paid: 0 },
      ]),
    ).toBe(3900);
  });

  it("formats TRY output for parent and manager surfaces", () => {
    expect(formatTry(3250)).toContain("₺");
  });
});
