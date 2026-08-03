/**
 * Landing gateway interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('gateway');
  if (!root) return;

  const panels = Array.from(root.querySelectorAll('.gateway-panel'));

  panels.forEach((panel) => {
    const key = panel.dataset.panel; // solar | led

    panel.addEventListener('mouseenter', () => {
      root.classList.remove('is-hover-solar', 'is-hover-led');
      root.classList.add(`is-hover-${key}`);
      panels.forEach((p) => p.classList.toggle('is-active', p === panel));
    });

    panel.addEventListener('mouseleave', () => {
      // keep last active until another hover; clear when leaving gateway
    });

    panel.addEventListener('focusin', () => {
      root.classList.remove('is-hover-solar', 'is-hover-led');
      root.classList.add(`is-hover-${key}`);
      panels.forEach((p) => p.classList.toggle('is-active', p === panel));
    });
  });

  root.addEventListener('mouseleave', () => {
    root.classList.remove('is-hover-solar', 'is-hover-led');
    panels.forEach((p) => p.classList.remove('is-active'));
  });
});
