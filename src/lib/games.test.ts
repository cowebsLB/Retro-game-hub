import { parseGameCatalog, resolveAssetPath } from "./games";

describe("game catalog parsing", () => {
  it("parses a valid manifest", () => {
    expect(
      parseGameCatalog([
        {
          id: "one",
          title: "One",
          slug: "one",
          description: "desc",
          thumbnail: "images/one.svg",
          tags: ["Arcade"],
          era: "1980s",
          players: "1 Player",
          controls: ["Move"],
          sourceType: "local",
          playTarget: "one",
          featured: true,
          status: "ready",
          version: "1.0.0",
          lastUpdated: "2026-07-06T00:00:00.000Z",
          releaseNotes: ["note"],
        },
      ]),
    ).toHaveLength(1);
  });

  it("rejects duplicate slugs", () => {
    expect(() =>
      parseGameCatalog([
        {
          id: "one",
          title: "One",
          slug: "same",
          description: "desc",
          thumbnail: "images/one.svg",
          tags: ["Arcade"],
          era: "1980s",
          players: "1 Player",
          controls: ["Move"],
          sourceType: "local",
          playTarget: "one",
          featured: true,
          status: "ready",
          version: "1.0.0",
          lastUpdated: "2026-07-06T00:00:00.000Z",
          releaseNotes: ["note"],
        },
        {
          id: "two",
          title: "Two",
          slug: "same",
          description: "desc",
          thumbnail: "images/two.svg",
          tags: ["Arcade"],
          era: "1980s",
          players: "1 Player",
          controls: ["Move"],
          sourceType: "embed",
          playTarget: "https://example.com",
          featured: false,
          status: "beta",
          version: "0.1.0",
          lastUpdated: "2026-07-06T00:00:00.000Z",
          releaseNotes: ["note"],
        },
      ]),
    ).toThrow(/Duplicate game slug/);
  });

  it("resolves assets against the active base path", () => {
    expect(resolveAssetPath("images/test.svg")).toMatch(/images\/test\.svg$/);
  });
});
