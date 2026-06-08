const produtos = [
  { nome: "Arroz 5kg", preco: 24.90, sigla: "ARROZ" },
  { nome: "Feijao 1kg", preco: 8.50, sigla: "FEIJAO" },
  { nome: "Leite 1L", preco: 5.20, sigla: "LEITE" },
  { nome: "Pao Fatiado", preco: 7.90, sigla: "PAO FATIADO" },
  { nome: "Frango 1kg", preco: 19.90, sigla: "FRANGO" },
  { nome: "Ovos duzia", preco: 12.00, sigla: "OVO" },
  { nome: "Cafe 500g", preco: 18.50, sigla: "CAFE" },
  { nome: "Banana kg", preco: 4.90, sigla: "BANANA " },
];

let carrinho = [];
let fila = [];
let processados = [];
let pilha = [];
let contPedido = 1;
let estadoAtual = 0;
let pedidoAtual = "";
let usuarioAssinante = false;
let clienteLogado = null;

const estados = [
  "Em validacao",
  "Aguardando pagamento",
  "Em separacao",
  "Saiu para entrega",
  "Entregue",
];

function formatarMoeda(valor) {
  return valor.toFixed(2).replace(".", ",");
}

function escreverLog(id, texto) {
  const area = document.getElementById(id);
  const hora = new Date().toLocaleTimeString("pt-BR");
  area.textContent += `[${hora}] ${texto}\n`;
  area.scrollTop = area.scrollHeight;
}

function registrarHistorico(texto) {
  pilha.push(texto);
  renderPilha();
  escreverLog("pilha-log", texto);
}

function renderLogin() {
  const status = document.getElementById("status-login");
  const botaoLogin = document.getElementById("btn-login");
  const botaoSair = document.getElementById("btn-sair");

  if (clienteLogado) {
    status.textContent = `Cliente logado: ${clienteLogado.nome} (${clienteLogado.email})`;
    status.classList.add("ativo");
    botaoLogin.disabled = true;
    botaoSair.style.display = "inline-block";
  } else {
    status.textContent = "Cliente nao logado. Faca login antes de assinar ou comprar.";
    status.classList.remove("ativo");
    botaoLogin.disabled = false;
    botaoSair.style.display = "none";
  }
}

function fazerLogin() {
  const nome = document.getElementById("cliente-nome").value.trim();
  const email = document.getElementById("cliente-email").value.trim();

  if (!nome || !email) {
    alert("Preencha nome e e-mail para fazer login.");
    return;
  }

  clienteLogado = { nome, email };
  renderLogin();
  registrarHistorico(`Cliente fez login: ${nome}`);
  alert(`Bem-vindo, ${nome}!`);
}

function sairLogin() {
  if (!clienteLogado) return;

  registrarHistorico(`Cliente saiu do sistema: ${clienteLogado.nome}`);
  clienteLogado = null;
  usuarioAssinante = false;
  document.getElementById("cliente-nome").value = "";
  document.getElementById("cliente-email").value = "";
  renderLogin();
  renderAssinatura();
}

function renderAssinatura() {
  const status = document.getElementById("status-assinatura");
  const botao = document.getElementById("btn-assinar");

  if (!clienteLogado) {
    status.textContent = "Faca login para ativar a assinatura.";
    status.classList.remove("ativo");
    botao.textContent = "Assinar plano";
    botao.disabled = false;
  } else if (usuarioAssinante) {
    status.textContent = "Assinatura ativa. Usuario liberado para comprar.";
    status.classList.add("ativo");
    botao.textContent = "Plano ativo";
    botao.disabled = true;
  } else {
    status.textContent = "Usuario sem assinatura ativa. Compra bloqueada.";
    status.classList.remove("ativo");
    botao.textContent = "Assinar plano";
    botao.disabled = false;
  }
}

function assinarPlano() {
  if (!clienteLogado) {
    alert("Faca login como cliente antes de assinar o plano.");
    document.getElementById("login").scrollIntoView({ behavior: "smooth" });
    registrarHistorico("Tentativa de assinatura bloqueada: cliente sem login");
    return;
  }

  usuarioAssinante = true;
  renderAssinatura();
  registrarHistorico(`${clienteLogado.nome} assinou o Plano Cliente DIGIMarket`);
  alert("Assinatura ativada. Agora o usuario pode finalizar compras.");
}

function renderProdutos() {
  const grid = document.getElementById("produtos-grid");
  const pesquisa = document.getElementById("pesquisa-produto").value.toLowerCase();

  const filtrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(pesquisa)
  );

  if (filtrados.length === 0) {
    grid.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  grid.innerHTML = filtrados.map(produto => `
    <div class="produto">
      <strong>${produto.sigla}</strong>
      <span>${produto.nome}</span>
      <small>R$ ${formatarMoeda(produto.preco)}</small>
      <button onclick="adicionarProduto('${produto.nome}')">Adicionar</button>
    </div>
  `).join("");
}

function limparPesquisa() {
  document.getElementById("pesquisa-produto").value = "";
  renderProdutos();
}

function adicionarProduto(nomeProduto) {
  const produto = produtos.find(item => item.nome === nomeProduto);
  carrinho.push(produto);
  escreverLog("lista-log", `Adicionado: ${produto.nome}`);
  registrarHistorico(`Adicionou ${produto.nome} ao carrinho`);
  renderCarrinho();
}

function removerProduto(posicao) {
  const removido = carrinho.splice(posicao, 1)[0];
  escreverLog("lista-log", `Removido: ${removido.nome}`);
  registrarHistorico(`Removeu ${removido.nome} do carrinho`);
  renderCarrinho();
}

function listaLimpar() {
  if (carrinho.length === 0) return;
  carrinho = [];
  escreverLog("lista-log", "Carrinho limpo.");
  registrarHistorico("Limpou o carrinho");
  renderCarrinho();
}

function renderCarrinho() {
  const visual = document.getElementById("lista-visual");
  const total = document.getElementById("lista-total");
  const botaoFinalizar = document.getElementById("btn-finalizar");

  if (carrinho.length === 0) {
    visual.innerHTML = "<p>Carrinho vazio.</p>";
    total.textContent = "";
    botaoFinalizar.style.display = "none";
    return;
  }

  botaoFinalizar.style.display = "inline-block";

  visual.innerHTML = carrinho.map((item, posicao) => `
    <div class="item-carrinho">
      <span>${posicao + 1}. ${item.nome} - R$ ${formatarMoeda(item.preco)}</span>
      <button onclick="removerProduto(${posicao})">Excluir</button>
    </div>
  `).join("");

  const valorTotal = carrinho.reduce((soma, item) => soma + item.preco, 0);
  total.textContent = `Total: R$ ${formatarMoeda(valorTotal)} | ${carrinho.length} item(s)`;
}

function finalizarCompra() {
  if (!clienteLogado) {
    alert("Faca login como cliente antes de finalizar a compra.");
    escreverLog("lista-log", "Compra bloqueada: cliente sem login.");
    registrarHistorico("Tentativa de compra bloqueada: cliente sem login");
    document.getElementById("login").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!usuarioAssinante) {
    alert("Apenas usuarios assinantes podem finalizar compras. Assine o plano no topo do site.");
    escreverLog("lista-log", "Compra bloqueada: usuario sem assinatura ativa.");
    registrarHistorico("Tentativa de compra bloqueada por falta de assinatura");
    document.getElementById("assinatura").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (carrinho.length === 0) {
    alert("Adicione produtos antes de avancar.");
    return;
  }

  const total = carrinho.reduce((soma, item) => soma + item.preco, 0);
  const resumo = carrinho.map(item => item.nome).join(", ");

  pedidoAtual = `Pedido #${String(contPedido++).padStart(3, "0")} - ${clienteLogado.nome} - R$ ${formatarMoeda(total)}`;
  fila.push(pedidoAtual);

  escreverLog("lista-log", `Compra finalizada: ${pedidoAtual}`);
  escreverLog("fila-log", `Novo pedido realizado: ${pedidoAtual}`);
  registrarHistorico(`Pedido realizado com ${carrinho.length} item(s): ${resumo}`);

  carrinho = [];
  estadoAtual = 0;
  renderCarrinho();
  renderFila();
  renderEstado();
  abrirTab("tab-pedidos", document.querySelector('button[onclick*="tab-pedidos"]'));
}

function renderFila() {
  const visual = document.getElementById("fila-visual");

  visual.innerHTML = fila.length
    ? fila.map(pedido => `<span class="item">${pedido}</span>`).join("")
    : "<p>Fila vazia.</p>";

  document.getElementById("fila-lista").innerHTML = fila.length
    ? fila.map((pedido, indice) => `<p>${indice + 1}. ${pedido}</p>`).join("")
    : "<p>Nenhum pedido aguardando.</p>";

  document.getElementById("fila-processados").innerHTML = processados.length
    ? processados.map(pedido => `<p>${pedido}</p>`).join("")
    : "<p>Nenhum pedido processado.</p>";
}

function filaEnqueue() {
  const input = document.getElementById("fila-input");
  const pedido = input.value.trim() || `Pedido #${String(contPedido++).padStart(3, "0")}`;

  fila.push(pedido);
  input.value = "";
  escreverLog("fila-log", `Entrou na fila: ${pedido}`);
  renderFila();
}

function filaDequeue() {
  if (fila.length === 0) {
    escreverLog("fila-log", "Fila vazia.");
    return;
  }

  const pedido = fila.shift();
  processados.push(pedido);
  escreverLog("fila-log", `Pedido processado: ${pedido}`);
  registrarHistorico(`Pedido processado: ${pedido}`);
  renderFila();
}

function renderPilha() {
  const visual = document.getElementById("pilha-visual");
  document.getElementById("pilha-size").textContent = pilha.length;

  if (pilha.length === 0) {
    visual.innerHTML = "<p>Pilha vazia.</p>";
    document.getElementById("pilha-topo-label").textContent = "";
    return;
  }

  document.getElementById("pilha-topo-label").textContent = `Topo: ${pilha[pilha.length - 1]}`;
  visual.innerHTML = pilha.map((acao, indice) => `
    <span class="item">${indice}: ${acao}</span>
  `).join("");
}

function pilhaPush() {
  const input = document.getElementById("pilha-input");
  const acao = input.value.trim();

  if (!acao) {
    alert("Digite uma acao.");
    return;
  }

  pilha.push(acao);
  input.value = "";
  escreverLog("pilha-log", `Acao registrada: ${acao}`);
  renderPilha();
}

function pilhaPop() {
  if (pilha.length === 0) {
    escreverLog("pilha-log", "Pilha vazia.");
    return;
  }

  const acao = pilha.pop();
  escreverLog("pilha-log", `Acao desfeita: ${acao}`);
  renderPilha();
}

function pilhaPeek() {
  if (pilha.length === 0) {
    alert("Pilha vazia.");
    return;
  }

  alert(`Topo da pilha: ${pilha[pilha.length - 1]}`);
}

function abrirTab(id, botao) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  botao.classList.add("active");
}

function renderEstado() {
  const estado = estados[estadoAtual];
  const titulo = pedidoAtual || "Nenhum pedido finalizado ainda";
  document.getElementById("estado-atual").innerHTML = `
    <p>${titulo}</p>
    <strong>${estado}</strong>
    <p>Passo ${estadoAtual + 1} de ${estados.length}</p>
  `;
}

function avancarEstado() {
  if (estadoAtual < estados.length - 1) {
    estadoAtual++;
    registrarHistorico(`Status alterado para: ${estados[estadoAtual]}`);
    renderEstado();
  } else {
    alert("Pedido ja foi entregue.");
  }
}

function cancelarPedido() {
  document.getElementById("estado-atual").innerHTML = "<strong>Cancelado</strong><p>Pedido cancelado antes da entrega.</p>";
  registrarHistorico("Pedido cancelado");
}

function resetarPedido() {
  estadoAtual = 0;
  registrarHistorico("Status reiniciado");
  renderEstado();
}

function iniciar() {
  renderLogin();
  renderAssinatura();
  renderProdutos();
  renderCarrinho();
  renderFila();
  renderPilha();
  renderEstado();
}

document.addEventListener("DOMContentLoaded", iniciar);
