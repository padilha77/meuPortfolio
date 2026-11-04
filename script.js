const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Nome: cada letra surge em sequência */
(function () {
  const titulo = document.querySelector(".nome");
  let i = 0;
  function dividir(no) {
    [...no.childNodes].forEach(filho => {
      if (filho.nodeType === 3) {
        const parte = document.createDocumentFragment();
        for (const ch of filho.textContent) {
          const s = document.createElement("span");
          s.className = "letra";
          s.setAttribute("aria-hidden", "true");
          s.style.setProperty("--i", i++);
          s.textContent = ch === " " ? "\u00a0" : ch;
          parte.appendChild(s);
        }
        no.replaceChild(parte, filho);
      } else {
        dividir(filho);
      }
    });
  }
  dividir(titulo);
})();

/* Fundo de espaço: estrelas vindo em direção a você */
const canvas = document.getElementById("estrelas");
const ctx = canvas.getContext("2d");
let largura = 0, altura = 0, foco = 0, estrelas = [];
let alvoX = 0, alvoY = 0, desvioX = 0, desvioY = 0;
let impulso = 0, ultimoScroll = window.scrollY, ultimoTempo = 0;
const VELOCIDADE = 0.00020; // quanto menor, mais lento o voo

function novaEstrela(inicial) {
  const z = inicial ? Math.random() * 0.85 + 0.15 : 1;
  const dispersao = inicial ? 1 : 0.8;
  return {
    x: (Math.random() - 0.5) * largura * dispersao * z / foco,
    y: (Math.random() - 0.5) * altura * dispersao * z / foco,
    z,
    cor: "255,255,255"
  };
}

function criarEstrelas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  largura = window.innerWidth;
  altura = window.innerHeight;
  foco = Math.max(largura, altura) * 0.5;
  canvas.width = largura * dpr;
  canvas.height = altura * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  const total = Math.min(Math.round((largura * altura) / 5000), 520);
  estrelas = Array.from({ length: total }, () => novaEstrela(true));
}

function desenhar(tempo) {
  const dt = Math.min(tempo - ultimoTempo || 16, 50);
  ultimoTempo = tempo;

  desvioX += (alvoX - desvioX) * 0.04;
  desvioY += (alvoY - desvioY) * 0.04;
  impulso *= 0.94;

  /* com "reduzir movimento" ligado no sistema, o céu anda na metade da velocidade e sem reagir ao mouse */
  const passo = (reduzir ? VELOCIDADE * 0.5 : VELOCIDADE + impulso) * dt;
  const cx = largura / 2 + desvioX;
  const cy = altura / 2 + desvioY;

  ctx.clearRect(0, 0, largura, altura);

  for (const e of estrelas) {
    const zAntes = e.z + passo * 5;
    e.z -= passo;

    const sx = cx + (e.x / e.z) * foco;
    const sy = cy + (e.y / e.z) * foco;
    if (e.z <= 0.02 || sx < -20 || sx > largura + 20 || sy < -20 || sy > altura + 20) {
      Object.assign(e, novaEstrela(false));
      continue;
    }

    const perto = 1 - e.z;
    ctx.strokeStyle = "rgba(" + e.cor + "," + Math.min(1, perto * 1.5 + 0.15) + ")";
    ctx.lineWidth = perto * 1.8 + 0.4;
    ctx.beginPath();
    ctx.moveTo(cx + (e.x / zAntes) * foco, cy + (e.y / zAntes) * foco);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }

  requestAnimationFrame(desenhar);
}

criarEstrelas();
requestAnimationFrame(desenhar);

/* O céu acompanha o mouse e acelera quando você rola a página */
window.addEventListener("mousemove", e => {
  if (reduzir) return;
  alvoX = (0.5 - e.clientX / largura) * 70;
  alvoY = (0.5 - e.clientY / altura) * 70;
});
window.addEventListener("scroll", () => {
  impulso = Math.min(impulso + Math.abs(window.scrollY - ultimoScroll) * 0.000004, 0.0006);
  ultimoScroll = window.scrollY;
}, { passive: true });

let larguraAnterior = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth === larguraAnterior) return;
  larguraAnterior = window.innerWidth;
  criarEstrelas();

});

/* Cargo digitado */
const cargos = ["Desenvolvedor Java", "Estudante de Engenharia de Software", "Apaixonado por tecnologia"];
const campo = document.getElementById("cargo");
let cargoAtual = 0, letra = 0, apagando = false;

function digitar() {
  const texto = cargos[cargoAtual];
  campo.textContent = texto.slice(0, letra);
  let espera = apagando ? 35 : 80;

  if (!apagando && letra === texto.length) {
    apagando = true;
    espera = 1800;
  } else if (apagando && letra === 0) {
    apagando = false;
    cargoAtual = (cargoAtual + 1) % cargos.length;
    espera = 400;
  } else {
    letra += apagando ? -1 : 1;
  }
  setTimeout(digitar, espera);
}
campo.textContent = "";
setTimeout(digitar, 2600);

/* Menu */
const botao = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

function alternarMenu(abrir) {
  menu.classList.toggle("aberto", abrir);
  botao.setAttribute("aria-expanded", abrir);
  botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}
botao.addEventListener("click", () => alternarMenu(!menu.classList.contains("aberto")));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => alternarMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") alternarMenu(false); });

/* A navegação acompanha a seção que ocupa o início da tela. */
const destinos = [...menu.querySelectorAll("a")].map(link => ({
  link,
  secao: document.querySelector(link.hash)
}));
function atualizarDestino() {
  let atual = destinos[0];
  for (const destino of destinos) {
    if (destino.secao.getBoundingClientRect().top <= window.innerHeight * 0.35) atual = destino;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    atual = destinos[destinos.length - 1];
  }
  for (const destino of destinos) {
    if (destino === atual) destino.link.setAttribute("aria-current", "location");
    else destino.link.removeAttribute("aria-current");
  }
}
window.addEventListener("scroll", atualizarDestino, { passive: true });
window.addEventListener("resize", atualizarDestino);
atualizarDestino();
