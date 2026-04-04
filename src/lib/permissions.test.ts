import { describe, expect, it } from "vitest";

import {
  canManageOperations,
  canManageSystem,
  canTakeAttendance,
  canViewFinance,
} from "@/lib/permissions";

describe("permission matrix", () => {
  it("restricts system management to admin", () => {
    expect(canManageSystem("admin")).toBe(true);
    expect(canManageSystem("manager")).toBe(false);
  });

  it("allows operations to admin and manager", () => {
    expect(canManageOperations("admin")).toBe(true);
    expect(canManageOperations("manager")).toBe(true);
    expect(canManageOperations("coach")).toBe(false);
  });

  it("blocks finance access for coach", () => {
    expect(canViewFinance("coach")).toBe(false);
    expect(canViewFinance("parent")).toBe(true);
  });

  it("keeps attendance actions in operational roles", () => {
    expect(canTakeAttendance("coach")).toBe(true);
    expect(canTakeAttendance("parent")).toBe(false);
  });
});
