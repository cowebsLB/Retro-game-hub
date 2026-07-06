import { filterGames, getCatalogTags, getFeaturedGame, getGameBySlug } from "./catalog";
import { catalogGames } from "./games";

describe("catalog helpers", () => {
  it("returns the featured game", () => {
    expect(getFeaturedGame(catalogGames)?.slug).toBe("neon-meteor-run");
  });

  it("filters by query and tag", () => {
    const result = filterGames(catalogGames, "archive", "Embed");
    expect(result.map((game) => game.slug)).toEqual(["hextris-archive-cabinet", "oregon-trail-archive"]);
  });

  it("searches release notes and version text", () => {
    const result = filterGames(catalogGames, "pulse", "All");
    expect(result.map((game) => game.slug)).toContain("neon-meteor-run");
  });

  it("finds a game by slug", () => {
    expect(getGameBySlug(catalogGames, "oregon-trail-archive")?.title).toBe("Oregon Trail Archive");
  });

  it("builds sorted unique tags", () => {
    expect(getCatalogTags(catalogGames)).toContain("Arcade");
    expect(getCatalogTags(catalogGames)[0]).toBe("Adventure");
  });
});
