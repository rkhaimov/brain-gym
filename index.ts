const PARTICLES_COUNT = 100;
const DURATION = 1000;
const START_X = 0;
const START_Y = 0;
const MAX_END_X = 200;
const MAX_UP_Y = -200;

type AnimationData = {
  particle: ReturnType<typeof createParticle>;
  endX: number;
  maxY: number;
};

const particles: Array<AnimationData> = [];

for (let i = 0; i < PARTICLES_COUNT; i++) {
  particles.push({
    particle: createParticle(),
    endX: Math.random() * MAX_END_X * (Math.random() > 0.5 ? 1 : -1),
    maxY: Math.random() * MAX_UP_Y,
  });
}

const animate = (time: number) => {
  if (time > DURATION) {
    return;
  }

  for (const item of particles) {
    const {particle, maxY, endX} = item;
    const resultX = START_X + endX * linear(time / DURATION);
    const resultY = START_Y + maxY * jump(time / DURATION);

    particle.style.transform =
      `translateX(${resultX}px) translateY(${resultY}px)`;
  }

  requestAnimationFrame(animate);
};

const jump = (progress: number): number =>
  (progress - Math.pow(progress, 2)) * 4;

const linear = (progress: number): number => progress;

requestAnimationFrame(animate);

function createParticle() {
  const particle = document.createElement('div');

  particle.classList.add('particle');

  const container = document.querySelector('.container')!;

  container.appendChild(particle);

  return particle;
}
