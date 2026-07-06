import "@testing-library/jest-dom/vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () =>
    ({
      clearRect: () => undefined,
      createLinearGradient: () => ({
        addColorStop: () => undefined,
      }),
      createRadialGradient: () => ({
        addColorStop: () => undefined,
      }),
      fillRect: () => undefined,
      beginPath: () => undefined,
      arc: () => undefined,
      fill: () => undefined,
      stroke: () => undefined,
      strokeRect: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      quadraticCurveTo: () => undefined,
      ellipse: () => undefined,
      roundRect: () => undefined,
      setLineDash: () => undefined,
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
      lineDashOffset: 0,
    }) as Partial<CanvasRenderingContext2D>,
});
