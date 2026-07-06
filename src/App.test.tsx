import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Retro Game Hub app", () => {
  it("renders the catalog", () => {
    window.location.hash = "#/";
    render(<App />);
    expect(screen.getByRole("heading", { name: /playable retro picks/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /play neon meteor run/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /fresh cabinet notes/i })).toBeInTheDocument();
  });

  it("navigates from a game card to the play page", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/";
    render(<App />);
    await user.click(screen.getByRole("link", { name: /play neon meteor run/i }));
    expect(await screen.findByRole("heading", { name: /neon meteor run/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/local game arena/i)).toBeInTheDocument();
    expect(screen.getByText(/pulse cooldown/i)).toBeInTheDocument();
  });

  it("shows embed fallback after iframe failure", async () => {
    window.location.hash = "#/game/hextris-archive-cabinet";
    render(<App />);
    const iframe = await screen.findByTitle(/hextris archive cabinet embedded game/i);
    fireEvent.error(iframe);
    expect(await screen.findByRole("link", { name: /open in a new tab/i })).toBeInTheDocument();
  });
});
