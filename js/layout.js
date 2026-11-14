/* =========================================================
   layout.js – Menu de cima (computador), barra de baixo (celular)
   e a janela "Registrar entrega", usados em todas as telas internas
   ========================================================= */

function montarMenu(paginaAtiva) {
  const sessao = exigirLogin();
  if (!sessao) return null;

  const links = [
    { id: "inicio", texto: "Início", href: "inicio.html", icone: "⌂" },
    { id: "familias", texto: "Famílias", href: "familias.html", icone: "👥" },
    { id: "doacoes", texto: "Doações", href: "em-breve.html?tela=Doações", icone: "🎁" },
    { id: "relatorios", texto: "Relatórios", href: "relatorios.html", icone: "📊" }
  ];

  const topo = document.createElement("header");
  topo.className = "menu";
  topo.innerHTML = `
    <a class="logo" href="inicio.html" aria-label="AFH Cadastros – ir para o início">
      <span aria-hidden="true">♥</span> AFH Cadastros
    </a>
    <nav aria-label="Menu principal">
      ${links.map(l => `<a href="${l.href}" class="${l.id === paginaAtiva ? "ativo" : ""}"
        ${l.id === paginaAtiva ? 'aria-current="page"' : ""}>${l.texto}</a>`).join("")}
    </nav>
    <div class="usuario">
      <span>${escapar(sessao.nome)} · ${sessao.perfil === "administrador" ? "Administradora" : "Voluntário"}</span>
      <button type="button" id="btnSair">Sair</button>
    </div>`;
  document.body.prepend(topo);

  const baixo = document.createElement("nav");
  baixo.className = "menu-celular";
  baixo.setAttribute("aria-label", "Menu principal (celular)");
  baixo.innerHTML = links.map(l => `
    <a href="${l.href}" class="${l.id === paginaAtiva ? "ativo" : ""}">
      <span class="icone" aria-hidden="true">${l.icone}</span>${l.texto}
    </a>`).join("");
  document.body.append(baixo);

  document.getElementById("btnSair").addEventListener("click", () => sair());
  return sessao;
}

/* ---------- Janela "Registrar entrega" (HU06) ----------
   aoSalvar: função chamada depois que a entrega é gravada */
function abrirJanelaEntrega(idFamilia, aoSalvar) {
  const sessao = lerSessao();
  const familia = buscarFamiliaPorId(idFamilia);
  if (!familia) return;

  let janela = document.getElementById("janelaEntrega");
  if (!janela) {
    janela = document.createElement("dialog");
    janela.id = "janelaEntrega";
    janela.setAttribute("aria-labelledby", "tituloEntrega");
    document.body.append(janela);
  }

  const jaRecebeu = cestaDoMes(familia);
  janela.innerHTML = `
    <h2 id="tituloEntrega">Registrar entrega</h2>
    <p class="legenda" style="margin-bottom:16px">${escapar(familia.nome)} · ${escapar(familia.bairro)}</p>
    ${jaRecebeu
      ? `<p class="aviso atencao" role="alert">⚠ Esta família já recebeu cesta básica em ${formatarData(jaRecebeu.data)}. Confira antes de salvar.</p>`
      : `<p class="aviso ok">✓ Pode entregar: ainda não recebeu cesta este mês.</p>`}
    <form method="dialog" id="formEntrega" novalidate>
      <div class="campo">
        <label for="entregaData">Data *</label>
        <input type="date" id="entregaData" value="${hojeISO()}" required>
      </div>
      <div class="campo">
        <label for="entregaTipo">Tipo *</label>
        <select id="entregaTipo">
          <option>Cesta básica</option>
          <option>Roupa</option>
          <option>Outro</option>
        </select>
      </div>
      <div class="campo">
        <label for="entregaQtd">Quantidade *</label>
        <input type="number" id="entregaQtd" min="1" value="1" required>
      </div>
      <p class="msg-erro" id="erroEntrega" role="alert"></p>
      <div class="rodape-form" style="margin-top:8px">
        <button type="button" class="btn btn-secundario" id="cancelarEntrega">Cancelar</button>
        <button type="submit" class="btn btn-principal">Confirmar entrega</button>
      </div>
    </form>`;

  janela.querySelector("#cancelarEntrega").onclick = () => janela.close();
  janela.querySelector("#formEntrega").onsubmit = evento => {
    evento.preventDefault();
    const data = janela.querySelector("#entregaData").value;
    const tipo = janela.querySelector("#entregaTipo").value;
    const quantidade = Number(janela.querySelector("#entregaQtd").value);
    const erro = janela.querySelector("#erroEntrega");
    if (!data) { erro.textContent = "Informe a data da entrega."; return; }
    if (!quantidade || quantidade < 1) { erro.textContent = "A quantidade precisa ser 1 ou mais."; return; }
    registrarEntrega(idFamilia, { data, tipo, quantidade, registradoPor: sessao ? sessao.nome : "" });
    janela.close();
    if (aoSalvar) aoSalvar();
  };

  janela.showModal();
}
