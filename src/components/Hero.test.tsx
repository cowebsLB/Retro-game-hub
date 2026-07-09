import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the featured cabinet status from manifest data", () => {
    render(
      <MemoryRouter>
        <Hero
          featuredGame={{
            id: "test-cabinet",
            title: "Test Cabinet",
            slug: "test-cabinet",
            description: "A beta cabinet used for regression coverage.",
            thumbnail: "images/test-cabinet.jpg",
            tags: ["Arcade"],
            era: "1980s",
            players: "1 Player",
            controls: ["Press start"],
            sourceType: "local",
            playTarget: "test-cabinet",
            featured: true,
            status: "beta",
            version: "0.9.0",
            lastUpdated: "2026-07-09T10:00:00.000Z",
            releaseNotes: ["Preview build"],
          }}
          syncMeta={{
            syncing: false,
            source: "remote",
            lastSyncLabel: "1m ago",
            error: null,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
  });
});
