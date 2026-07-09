import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText(/pulse charge/i)).toBeInTheDocument();
  });

  it("renders the skyline sprint custom cabinet", async () => {
    window.location.hash = "#/game/skyline-sprint-gx";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /skyline sprint gx/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/skyline sprint gx playfield/i)).toBeInTheDocument();
    expect(screen.getByText(/boost reserve/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hold boost/i })).toBeInTheDocument();
    expect(screen.getByText(/swipe or tap lanes/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /shift left/i })).not.toBeInTheDocument();
  });

  it("renders the memory vault custom cabinet", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/game/memory-vault-84";
    render(<App />);
    const hiddenCard = await screen.findByRole("button", { name: /^Hidden vault card 1$/i });
    await user.click(hiddenCard);
    expect(screen.getByLabelText(/glyph/i)).toBeInTheDocument();
    expect(screen.getByText(/security status/i)).toBeInTheDocument();
  });

  it("renders the pixel breach custom cabinet", async () => {
    window.location.hash = "#/game/pixel-breach";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /pixel breach/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/pixel breach game arena/i)).toBeInTheDocument();
    expect(screen.getByText(/combat systems/i)).toBeInTheDocument();
    expect(screen.getByText(/press and drag to move \+ auto-fire/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /strafe left/i })).not.toBeInTheDocument();
  });

  it("renders the neon meteor mobile control dock", async () => {
    window.location.hash = "#/game/neon-meteor-run";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /neon meteor run/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pulse burst/i })).toBeInTheDocument();
    expect(screen.getByText(/drag the ship in the playfield/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move up/i })).not.toBeInTheDocument();
  });
});
