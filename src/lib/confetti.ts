import confetti from "canvas-confetti";

export function celebrateTaskCompletion() {
  void confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 32,
    origin: { y: 0.7 },
    colors: ["#22c55e", "#38bdf8", "#f59e0b", "#a78bfa", "#f4f4f5"],
    disableForReducedMotion: true,
  });
}
