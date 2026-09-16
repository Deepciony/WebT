<template>
    <div class="confetti" aria-hidden="true">
        <span v-for="piece in pieces" :key="piece.id" class="piece" :style="piece.style"></span>
        <span class="burst">★</span>
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
.burst { display: none; }
@keyframes fall {
    to { opacity: 0; transform: translate(var(--drift), 100vh) rotate(var(--spin)); }
}
@media (prefers-reduced-motion: reduce) {
    .piece { display: none; }
    .burst { position: absolute; top: 30%; left: 50%; display: block; color: var(--sun); font-size: 96px; transform: translate(-50%, -50%); }
}
</style>
