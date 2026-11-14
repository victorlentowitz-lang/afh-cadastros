/* =========================================================
   dados.js – Onde ficam as famílias e as entregas
   Nesta sprint os dados ficam no localStorage do navegador.
   (Na próxima sprint a ideia é trocar por um banco de dados.)
   ========================================================= */

const CHAVE_DADOS = "afh_dados_v1";

/* Dados de exemplo, iguais aos que aparecem no protótipo */
function dadosIniciais() {
  const hoje = new Date();
  const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 12);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 3);
  const iso = d => d.toISOString().slice(0, 10);

  return {
    proximoId: 5,
    familias: [
      {
        id: 1, nome: "Maria Aparecida dos Santos", cpf: "52998224725", telefone: "(42) 99999-0000",
        endereco: "Rua das Flores, 120", bairro: "Primavera", moradores: 3, renda: "1.200,00",
        observacoes: "", ativa: true,
        membros: [
          { nome: "Ana Clara", nascimento: "2014-03-10", parentesco: "Filha" },
          { nome: "Pedro Henrique", nascimento: "2018-07-22", parentesco: "Filho" }
        ],
        entregas: [
          { data: iso(inicioMes), tipo: "Cesta básica", quantidade: 1, registradoPor: "Pedro" },
          { data: iso(mesPassado), tipo: "Cesta básica", quantidade: 1, registradoPor: "Pedro" }
        ]
      },
      {
        id: 2, nome: "João Batista Ferreira", cpf: "11144477735", telefone: "(42) 98888-1111",
        endereco: "Rua XV de Novembro, 45", bairro: "Vila Bela", moradores: 3, renda: "900,00",
        observacoes: "Prefere receber pela manhã.", ativa: true,
        membros: [
          { nome: "Rosa Ferreira", nascimento: "1975-01-30", parentesco: "Esposa" },
          { nome: "Lucas Ferreira", nascimento: "2010-11-05", parentesco: "Filho" }
        ],
        entregas: [
          { data: iso(mesPassado), tipo: "Cesta básica", quantidade: 1, registradoPor: "Pedro" }
        ]
      },
      {
        id: 3, nome: "Antônio Carlos de Lima", cpf: "39053344705", telefone: "(42) 97777-2222",
        endereco: "Av. Manoel Ribas, 900", bairro: "Jardim das Américas", moradores: 2, renda: "1.412,00",
        observacoes: "", ativa: true,
        membros: [{ nome: "Helena de Lima", nascimento: "1960-09-14", parentesco: "Esposa" }],
        entregas: []
      },
      {
        id: 4, nome: "Sebastiana Rodrigues", cpf: "15350946056", telefone: "(42) 96666-3333",
        endereco: "Rua Guaíra, 300", bairro: "Santa Cruz", moradores: 1, renda: "706,00",
        observacoes: "Mudou de cidade.", ativa: false,
        membros: [],
        entregas: [{ data: iso(mesPassado), tipo: "Roupa", quantidade: 4, registradoPor: "Patrícia" }]
      }
    ]
  };
}

function carregarDados() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_DADOS));
    if (salvo && Array.isArray(salvo.familias)) return salvo;
  } catch (e) { /* dados corrompidos: recomeça */ }
  const novos = dadosIniciais();
  salvarDados(novos);
  return novos;
}

function salvarDados(dados) {
  localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

function listarFamilias() {
  return carregarDados().familias;
}

function buscarFamiliaPorId(id) {
  return listarFamilias().find(f => f.id === Number(id)) || null;
}

/* ---------- CPF ---------- */
function somenteNumeros(texto) {
  return String(texto || "").replace(/\D/g, "");
}

function formatarCPF(cpf) {
  const n = somenteNumeros(cpf).padStart(11, "0").slice(0, 11);
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/* Máscara enquanto a pessoa digita: 000.000.000-00 */
function mascararCPF(valor) {
  const n = somenteNumeros(valor).slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/* Confere os dois dígitos verificadores do CPF */
function cpfValido(cpf) {
  const n = somenteNumeros(cpf);
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const calcDigito = qtd => {
    let soma = 0;
    for (let i = 0; i < qtd; i++) soma += Number(n[i]) * (qtd + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calcDigito(9) === Number(n[9]) && calcDigito(10) === Number(n[10]);
}

/* RF06 / HU03: devolve a família que já tem esse CPF (ou null) */
function familiaComCPF(cpf, ignorarId) {
  const n = somenteNumeros(cpf);
  return listarFamilias().find(f => f.cpf === n && f.id !== ignorarId) || null;
}

/* ---------- Salvar / editar ---------- */
function salvarFamilia(familia) {
  const dados = carregarDados();
  if (familia.id) {
    const i = dados.familias.findIndex(f => f.id === familia.id);
    dados.familias[i] = { ...dados.familias[i], ...familia };
  } else {
    familia.id = dados.proximoId++;
    familia.entregas = [];
    familia.ativa = true;
    dados.familias.push(familia);
  }
  salvarDados(dados);
  return familia.id;
}

/* ---------- Entregas (HU06 / HU07) ---------- */
function hojeISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function mesAtual() {
  return hojeISO().slice(0, 7); // "2026-11"
}

function cestaDoMes(familia) {
  return (familia.entregas || []).find(
    e => e.tipo === "Cesta básica" && e.data.slice(0, 7) === mesAtual()
  ) || null;
}

function registrarEntrega(idFamilia, entrega) {
  const dados = carregarDados();
  const familia = dados.familias.find(f => f.id === Number(idFamilia));
  familia.entregas.push(entrega);
  salvarDados(dados);
}

/* ---------- Formatação ---------- */
function formatarData(iso) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function idade(nascimentoISO) {
  if (!nascimentoISO) return "";
  const n = new Date(nascimentoISO + "T00:00:00");
  const h = new Date();
  let anos = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) anos--;
  return anos;
}

function nomeDoMes() {
  return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/* Evita que um texto digitado vire HTML na tela */
function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
