import { getLocalGameComponent, localGameRegistry } from "./localGames";

describe("local game registry", () => {
  it("maps each local play target to an implementation", () => {
    expect(Object.keys(localGameRegistry)).toEqual([
      "neon-meteor-run",
      "skyline-sprint-gx",
      "memory-vault-84",
      "pixel-breach",
    ]);
  });

  it("returns undefined for unknown local cabinets", () => {
    expect(getLocalGameComponent("unknown-cabinet")).toBeUndefined();
  });
});
