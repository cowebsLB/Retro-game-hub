import "@testing-library/jest-dom/vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () =>
    ({
      clearRect: () => undefined,
      createLinearGradient: () => ({
        addColorStop: () => undefined,
      }),
      fillRect: () => undefined,
      beginPath: () => undefined,
      arc: () => undefined,
      fill: () => undefined,
      stroke: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      closePath: () => undefined,
      save: () => undefined,
      restore: () => undefined,
      translate: () => undefined,
      rotate: () => undefined,
      fillText: () => undefined,
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      shadowColor: "",
      shadowBlur: 0,
      globalAlpha: 1,
      font: "",
      textAlign: "center",
    }) as Partial<CanvasRenderingContext2D>,
});
