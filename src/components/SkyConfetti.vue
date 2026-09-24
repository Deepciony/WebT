<template>
    <div class="confetti" aria-hidden="true">
        <span class="burst" aria-hidden="true">★</span>
        <span v-for="piece in pieces" :key="piece.id" class="piece" :style="piece.style"></span>
    </div>
</template>

<script setup>
const colors = ['var(--sky)', 'var(--sun)', 'var(--leaf)', 'var(--berry)']
const pieces = Array.from({ length: 36 }, (_, id) => ({
    id,
    style: {
        left: `${Math.random() * 100}%`,
        background: colors[id % colors.length],
        animationDelay: `${Math.random() * 300}ms`,
        '--drift': `${Math.random() * 160 - 80}px`,
        '--spin': `${Math.random() * 720 - 360}deg`
    }
}))
</script>

<style scoped>
.confetti { position: fixed; inset: 0; z-index: 50; overflow: hidden; pointer-events: none; }
.piece {
    position: absolute;
    top: -16px;
    width: 10px;
    height: 16px;
    border-radius: 3px;
    animation: fall 1.6s cubic-bezier(.25, .6, .5, 1) forwards;
}
.burst {
    position: absolute;
    top: 18px;
    left: 50%;
    display: block;
    color: var(--sun);
    font-size: clamp(52px, 5vw, 96px);
    line-height: 1;
    text-shadow: 0 8px 18px rgba(255, 191, 0, .35);
    transform: translateX(-50%);
    animation: sparkle 1.4s ease-in-out infinite alternate;
}
@keyframes fall {
    to { opacity: 0; transform: translate(var(--drift), 100vh) rotate(var(--spin)); }
}
@keyframes sparkle {
    0% { transform: translateX(-50%) scale(.92); opacity: .85; }
    100% { transform: translateX(-50%) scale(1.08); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
    .piece { display: none; }
    .burst { animation: none; }
}
</style>
