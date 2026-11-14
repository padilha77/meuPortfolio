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
  // Finaliza a entrada mesmo se o navegador suspender as animações da aba.
  setTimeout(() => titulo.classList.add("entradaConcluida"), i * 70 + 1200);
})();

/* Fundo de espaço: estrelas vindo em direção a você */
const canvas = document.getElementById("estrelas");
const ctx = canvas.getContext("2d");
let largura = 0, altura = 0, foco = 0, estrelas = [];
let alvoX = 0, alvoY = 0, desvioX = 0, desvioY = 0;
let impulso = 0, ultimoScroll = window.scrollY, ultimoTempo = 0;
const VELOCIDADE = 0.00008; // quanto menor, mais lento o voo

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

  const temaClaro = document.documentElement.dataset.tema === "claro";
  ctx.clearRect(0, 0, largura, altura);

  for (const e of estrelas) {
    const zAntes = e.z + passo * 1.5;
    e.z -= passo;

    const sx = cx + (e.x / e.z) * foco;
    const sy = cy + (e.y / e.z) * foco;
    if (e.z <= 0.02 || sx < -20 || sx > largura + 20 || sy < -20 || sy > altura + 20) {
      Object.assign(e, novaEstrela(false));
      continue;
    }

    const perto = 1 - e.z;
    if (temaClaro) {
      ctx.fillStyle = "rgba(0,0,0," + Math.min(1, perto + 0.4) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9 + perto * 1.4, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
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
const cargos = ["Desenvolvedor Java", "Estudante de Engenharia de Software"];
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
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
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

const temaBtn = document.getElementById("temaBtn");
function aplicarTema(claro) {
  document.documentElement.dataset.tema = claro ? "claro" : "escuro";
  const acao = claro ? "Ativar tema escuro" : "Ativar tema claro";
  temaBtn.setAttribute("aria-label", acao);
  temaBtn.title = acao;
}
try {
  aplicarTema(localStorage.getItem("tema") === "claro");
} catch {
  aplicarTema(false);
}
temaBtn.hidden = false;
temaBtn.addEventListener("click", () => {
  const claro = document.documentElement.dataset.tema !== "claro";
  aplicarTema(claro);
  try {
    localStorage.setItem("tema", claro ? "claro" : "escuro");
  } catch {
    // A alternância continua disponível quando o armazenamento está bloqueado.
  }
});

/* Exploração dos projetos: filtros e detalhes com foco gerenciado pelo dialog. */
const cards = [...document.querySelectorAll(".projetos .card")];
const filtros = document.getElementById("filtros");
const resultadoFiltro = document.getElementById("resultadoFiltro");
const detalhes = document.getElementById("detalhesProjeto");
const tecnologias = ["Todos", ...new Set(cards.flatMap(card =>
  [...card.querySelectorAll(".tags li")].map(tag => tag.textContent.trim())
))];

for (const tecnologia of tecnologias) {
  const filtro = document.createElement("button");
  filtro.type = "button";
  filtro.textContent = tecnologia;
  filtro.setAttribute("aria-pressed", String(tecnologia === "Todos"));
  filtro.addEventListener("click", () => {
    for (const card of cards) {
      const tags = [...card.querySelectorAll(".tags li")].map(tag => tag.textContent.trim());
      card.hidden = tecnologia !== "Todos" && !tags.includes(tecnologia);
    }
    for (const outro of filtros.children) {
      outro.setAttribute("aria-pressed", String(outro === filtro));
    }
    atualizarVitrine(cards.filter(card => !card.hidden));
    const total = projetosFiltrados.length;
    resultadoFiltro.textContent = total === 1 ? "1 projeto encontrado" : total + " projetos encontrados";
  });
  filtros.appendChild(filtro);
}
filtros.hidden = false;

for (const card of cards) {
  const botaoDetalhes = document.createElement("button");
  botaoDetalhes.className = "abrirDetalhes";
  botaoDetalhes.type = "button";
  botaoDetalhes.textContent = "Explorar projeto";
  botaoDetalhes.setAttribute("aria-haspopup", "dialog");
  botaoDetalhes.setAttribute("aria-label", "Explorar " + card.querySelector("h3").textContent);
  botaoDetalhes.addEventListener("click", () => {
    document.getElementById("tituloDetalhes").textContent = card.querySelector("h3").textContent;
    document.getElementById("textoDetalhes").textContent = card.querySelector("p").textContent;
    const visual = card.querySelector(".projetoImagem, .amostra").cloneNode(true);
    document.getElementById("imagemDetalhes").replaceChildren(visual);
    document.getElementById("tagsDetalhes").replaceChildren(
      ...[...card.querySelectorAll(".tags li")].map(tag => tag.cloneNode(true))
    );
    document.getElementById("linkDetalhes").href = card.querySelector("a").href;
    detalhes.showModal();
  });
  card.appendChild(botaoDetalhes);
}

detalhes.addEventListener("click", evento => {
  const area = detalhes.getBoundingClientRect();
  if (evento.target === detalhes &&
      (evento.clientX < area.left || evento.clientX > area.right ||
       evento.clientY < area.top || evento.clientY > area.bottom)) {
    detalhes.close();
  }
});

/* Vitrine: a seleção troca imagem, tecnologias e descrição em conjunto. */
let projetosFiltrados = cards;
let projetoAtual = 0;
const seletorProjetos = document.getElementById("seletorProjetos");
const posicaoProjeto = document.getElementById("posicaoProjeto");
const botoesProjeto = cards.map((card, indice) => {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = card.querySelector("h3").textContent;
  botao.addEventListener("click", () => {
    projetoAtual = projetosFiltrados.indexOf(card);
    exibirProjeto();
  });
  seletorProjetos.appendChild(botao);
  return botao;
});
function exibirProjeto() {
  const atual = projetosFiltrados[projetoAtual];
  cards.forEach((card, indice) => {
    card.hidden = card !== atual;
    botoesProjeto[indice].hidden = !projetosFiltrados.includes(card);
    botoesProjeto[indice].setAttribute("aria-pressed", String(card === atual));
  });
  posicaoProjeto.textContent = (projetoAtual + 1) + " / " + projetosFiltrados.length;
  document.getElementById("projetoAnterior").disabled = projetosFiltrados.length < 2;
  document.getElementById("projetoSeguinte").disabled = projetosFiltrados.length < 2;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    atual.animate([{ opacity: .3, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
      { duration: 260, easing: "ease-out" });
  }
}
function atualizarVitrine(projetos) {
  projetosFiltrados = projetos;
  projetoAtual = 0;
  exibirProjeto();
}
document.getElementById("projetoAnterior").addEventListener("click", () => {
  projetoAtual = (projetoAtual - 1 + projetosFiltrados.length) % projetosFiltrados.length;
  exibirProjeto();
});
document.getElementById("projetoSeguinte").addEventListener("click", () => {
  projetoAtual = (projetoAtual + 1) % projetosFiltrados.length;
  exibirProjeto();
});
document.querySelector(".controleVitrine").hidden = false;
document.querySelector(".projetos").classList.add("vitrine");
exibirProjeto();
document.querySelectorAll("[data-tecnologia]").forEach(botao => {
  botao.addEventListener("click", () => {
    const filtro = [...filtros.children].find(item => item.textContent === botao.dataset.tecnologia);
    filtro.click();
    document.getElementById("projetos").scrollIntoView({ behavior: reduzir ? "instant" : "smooth" });
    filtro.focus({ preventScroll: true });
  });
});