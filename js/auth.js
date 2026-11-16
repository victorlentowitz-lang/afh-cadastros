/* =========================================================
   auth.js – Login (HU01 / RF01) e sessão
   - Os usuários da equipe ficam guardados no código.
   - A senha NÃO fica em texto puro: guardamos só o hash SHA-256
     (com um "sal" por usuário), como pede o RNF02.
   - Depois de 30 minutos sem uso, a pessoa é desconectada (RNF02).
   ========================================================= */

// Usuários de teste (senha de todos: afh2026)
const USUARIOS = [
  {
    nome: "Patrícia",
    email: "patricia@afh.org.br",
    perfil: "administrador",
    sal: "p7Q2",
    hash: "2f20579a1d75538c473e9b31b0eeaf0d925e29b35efd6e32f7e0c44e1f84dc63"
  },
  {
    nome: "Pedro",
    email: "pedro@afh.org.br",
    perfil: "voluntario",
    sal: "x9K4",
    hash: "550af7226bd6710fa06b62f550b8d028a75d6bad4cbc8e099dc0625c41c59655"
  }
];

const TEMPO_LIMITE_MS = 30 * 60 * 1000; // 30 minutos
const CHAVE_SESSAO = "afh_sessao";

/* ---------- SHA-256 em JavaScript puro ----------
   (funciona até abrindo o arquivo direto no navegador, sem servidor) */
function sha256(texto) {
  const bytes = new TextEncoder().encode(texto);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  const tamBits = bytes.length * 8;
  const totalBytes = Math.ceil((bytes.length + 9) / 64) * 64;
  const msg = new Uint8Array(totalBytes);
  msg.set(bytes);
  msg[bytes.length] = 0x80;
  const visao = new DataView(msg.buffer);
  visao.setUint32(totalBytes - 4, tamBits >>> 0);
  visao.setUint32(totalBytes - 8, Math.floor(tamBits / 0x100000000));

  const W = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < totalBytes; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = visao.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map(n => n.toString(16).padStart(8, "0")).join("");
}

/* ---------- Validação do formulário de login ---------- */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* Confere e-mail e senha. Devolve o usuário ou null. */
function autenticar(email, senha) {
  const usuario = USUARIOS.find(u => u.email === email.trim().toLowerCase());
  if (!usuario) return null;
  const hashDigitado = sha256(usuario.sal + senha);
  return hashDigitado === usuario.hash ? usuario : null;
}

/* ---------- Sessão ---------- */
function iniciarSessao(usuario) {
  const sessao = {
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    ultimoUso: Date.now()
  };
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function lerSessao() {
  try {
    const sessao = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
    if (!sessao) return null;
    if (Date.now() - sessao.ultimoUso > TEMPO_LIMITE_MS) {
      sair("expirou");
      return null;
    }
    return sessao;
  } catch (e) {
    return null;
  }
}

function renovarSessao() {
  const sessao = lerSessao();
  if (!sessao) return;
  sessao.ultimoUso = Date.now();
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function sair(motivo) {
  sessionStorage.removeItem(CHAVE_SESSAO);
  window.location.href = "index.html" + (motivo ? "?motivo=" + motivo : "");
}

/* Usado no topo de toda tela interna: sem login, volta para a tela de entrar. */
function exigirLogin() {
  const sessao = lerSessao();
  if (!sessao) {
    window.location.replace("index.html");
    return null;
  }
  ["click", "keydown", "touchstart"].forEach(evento =>
    document.addEventListener(evento, renovarSessao, { passive: true })
  );
  // confere a cada minuto se passou do tempo limite
  setInterval(() => lerSessao(), 60 * 1000);
  return sessao;
}
