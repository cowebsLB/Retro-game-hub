import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import rawUpdates from "../data/updates.json";
import { catalogGames, parseGameUpdates } from "../lib/games";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("refreshes the live sync label as time advances", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-09T10:00:00.000Z"));

    render(
      <MemoryRouter>
        <HomePage
          feed={{
            games: catalogGames,
            updates: parseGameUpdates(rawUpdates),
            syncing: false,
            source: "remote",
            lastSyncAt: new Date("2026-07-09T09:59:00.000Z").getTime(),
            error: null,
          }}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText((content) => content.includes("Feed remote") && content.includes("1m ago")),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });

    expect(
      screen.getByText((content) => content.includes("Feed remote") && content.includes("2m ago")),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });
});
