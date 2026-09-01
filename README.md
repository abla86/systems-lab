# SYSTEMS LAB

AB Engineering-noden for runtime, ytelse og samtidighet.

## Engines

1. **Runtime Benchmark** — reproducerbar JavaScript-baseline for beregningsarbeid.
2. **Worker Pool** — interaktiv modell av bakgrunnsoppgaver og task scheduling.

## Teknisk integritet

Denne versjonen kaller ikke JavaScript-sløyfen for ekte WebAssembly og kaller ikke timer-modellen for ekte Web Workers. Begge er eksplisitt merket som demonstratorer i UI-et.

## Local

```powershell
npm test
npm run build
```

GitHub Actions kjører samme validering med Node.js 22.
