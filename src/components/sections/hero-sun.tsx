"use client";

import { useEffect, useRef } from "react";

const RAYS = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Sol do horizonte (restaurado da primeira versão do hero, commit 6a18aae).
 *
 * Original: semicírculo na base do hero que crescia até 9× com GSAP
 * ScrollTrigger (scrub), cobrindo a tela. Agora, na identidade azul-marinho,
 * o sol é creme e "nasce" do creme da seção seguinte: ao rolar, os raios se
 * abrem e o sol se expande; ao voltar, tudo recolhe (efeito reversível).
 *
 * Desempenho: um único listener de scroll passivo, ligado somente enquanto o
 * hero está visível (IntersectionObserver), no máximo um rAF por quadro, e
 * apenas `transform`/`opacity` escritos direto no DOM — nada de setState,
 * nenhuma leitura de layout durante a rolagem.
 */
export function HeroSun() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    const hero = wrap?.closest("section");
    const sun = wrap?.querySelector<HTMLElement>("[data-sun]");
    const rays = wrap?.querySelector<HTMLElement>("[data-rays]");
    const rings = wrap?.querySelector<SVGElement>("[data-rings]");
    if (!wrap || !hero || !sun || !rays) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fades = hero.querySelectorAll<HTMLElement>("[data-hero-fade]");
    let base = 0.4545; // escala inicial: o sol é desenhado grande e começa reduzido (borda nítida ao crescer)
    let endScale = 3;
    let distance = 1;
    let frame = 0;
    let listening = false;

    // Medidas só na montagem e no resize (nunca durante a rolagem).
    const measure = () => {
      const w = window.innerWidth;
      const h = hero.offsetHeight;
      const d = sun.offsetWidth || 1;
      const visible = Math.min(w * 0.46, 320); // diâmetro inicial visível (igual ao padding do hero)
      base = visible / d;
      distance = h * 0.8;
      // Raio final suficiente para cobrir a largura do hero e boa parte da altura.
      endScale = (2 * Math.hypot(w / 2, h * 0.7)) / d;
    };

    const render = () => {
      frame = 0;
      const p = clamp(window.scrollY / distance);
      const grow = smooth(clamp((p - 0.12) / 0.88)); // o sol cresce depois que os raios abrem
      const open = smooth(clamp(p / 0.5));
      sun.style.transform = `translate3d(-50%, 50%, 0) scale(${(base + (endScale - base) * grow * grow).toFixed(4)})`;
      rays.style.transform = `translate3d(-50%, 50%, 0) rotate(${(open * 22).toFixed(2)}deg) scale(${(0.62 + open * 0.78).toFixed(4)})`;
      rays.style.opacity = ((0.35 + open * 0.5) * (1 - grow)).toFixed(3);
      if (rings) rings.style.opacity = clamp(1 - grow * 3).toFixed(3);
      const fade = clamp(1 - p * 2.6);
      for (const el of fades) {
        el.style.opacity = fade.toFixed(3);
        el.style.transform = `translate3d(0, ${(-p * 32).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener("scroll", onScroll);
        render(); // fixa o estado final ao sair da área
      }
    });

    measure();
    render();
    io.observe(hero);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      sun.style.transform = "";
      rays.style.transform = "";
      rays.style.opacity = "";
      if (rings) rings.style.opacity = "";
      for (const el of fades) {
        el.style.opacity = "";
        el.style.transform = "";
      }
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-0">
      {/* Raios: atrás do sol; abrem (escala + rotação leve) conforme a rolagem */}
      <div
        data-rays
        className="absolute bottom-0 left-1/2 aspect-square w-[min(92vw,44rem)] will-change-transform"
        style={{ transform: "translate3d(-50%, 50%, 0) scale(0.62)", opacity: 0.35 }}
      >
        <svg viewBox="-100 -100 200 200" className="h-full w-full overflow-visible">
          {RAYS.map((deg, i) => (
            <line
              key={deg}
              x1="0"
              y1={i % 2 ? -60 : -56}
              x2="0"
              y2={i % 2 ? -78 : -96}
              stroke="var(--brand-sky)"
              strokeOpacity={i % 2 ? 0.45 : 0.8}
              strokeWidth={i % 2 ? 0.5 : 0.7}
              strokeLinecap="round"
              transform={`rotate(${deg})`}
            />
          ))}
        </svg>
      </div>
      {/* Sol: superfície creme plana (escala sem custo de rasterização visível) */}
      <div
        data-sun
        className="absolute bottom-0 left-1/2 aspect-square w-[min(92vw,44rem)] rounded-full bg-cream will-change-transform [transform:translate3d(-50%,50%,0)_scale(0.5)] md:[transform:translate3d(-50%,50%,0)_scale(0.4545)]"
      >
        <svg data-rings viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="38" fill="none" stroke="var(--brand-blue)" strokeOpacity="0.14" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="var(--brand-blue)" strokeOpacity="0.1" strokeWidth="0.6" />
        </svg>
      </div>
    </div>
  );
}
