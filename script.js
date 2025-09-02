document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const btnSortearDuplas = document.getElementById('sortear-duplas');
    const btnSortearQuartetos = document.getElementById('sortear-quartetos');
    const btnRefazerSorteio = document.getElementById('refazer-sorteio');
    const btnResetar = document.getElementById('resetar');
    const btnSelecionarTodos = document.getElementById('btn-selecionar-todos');
    const timesContainer = document.getElementById('times-container');
    const listaJogadoresContainer = document.getElementById('lista-jogadores');
    const btnAdicionarJogador = document.getElementById('btn-adicionar-jogador');
    const novoJogadorNomeInput = document.getElementById('novo-jogador-nome');

    // --- ESTADO DA APLICAÇÃO ---
    let ultimoSorteioJogadores = [];
    let ultimoTamanhoTime = 0;

    // --- DADOS INICIAIS ---
    const jogadoresIniciais = [
        { nome: "Michele", icone: "🍉" }, { nome: "Bruna", icone: "🏐" },
        { nome: "Adahil", icone: "🍺" }, { nome: "Filipe", icone: "🍹" },
        { nome: "Dekon", icone: "🏐" }, { nome: "Liana", icone: "🦶" },
        { nome: "Washington", icone: "🏐" }, { nome: "Amanda", icone: "👩" },
        { nome: "Livinha", icone: "👩" }, { nome: "Lilian", icone: "🏐" },
        { nome: "Dan", icone: "🧑‍🦲" }, { nome: "Larisse", icone: "🏐" },
        { nome: "Daniel", icone: "🏐" }, { nome: "Jéssica", icone: "🏐" },
        { nome: "Diego", icone: "🏐" }, { nome: "Renner", icone: "🏐" },
        { nome: "Chokito", icone: "🏐" }, { nome: "Sarah", icone: "🏐" },
        { nome: "Lairtu", icone: "🏐" }, { nome: "Nilton", icone: "🏐" },
        { nome: "Lívia", icone: "🏐" }, { nome: "Fernando", icone: "🔥" }
    ];

    // --- FUNÇÕES PRINCIPAIS ---

    /** Cria o elemento HTML para um jogador e o adiciona na lista */
    function renderizarJogador(jogador, isAvulso = false) {
        const jogadorId = `jogador-${jogador.nome.replace(/\s+/g, '-')}-${Date.now()}`;
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.innerHTML = `
            <div class="player-row">
                <div class="form-check player-select">
                    <input class="form-check-input chk-participar" type="checkbox" id="chk-${jogadorId}">
                    <label class="form-check-label" for="chk-${jogadorId}">
                        <span class="icone-jogador">${jogador.icone}</span>
                        <span class="nome-jogador">${jogador.nome}</span>
                    </label>
                </div>
                <div class="player-actions">
                    <div class="form-check form-switch">
                        <input class="form-check-input chk-levantador" type="checkbox" role="switch" id="levantador-${jogadorId}">
                        <label class="form-check-label" for="levantador-${jogadorId}">L</label>
                    </div>
                    ${isAvulso ? '<button class="btn btn-sm btn-outline-danger btn-remover">X</button>' : ''}
                </div>
            </div>
        `;
        listaJogadoresContainer.appendChild(item);
    }

    /** Popula a lista inicial de jogadores */
    function popularListaInicial() {
        listaJogadoresContainer.innerHTML = '';
        jogadoresIniciais.forEach(jogador => renderizarJogador(jogador, false));
    }

    /** Adiciona um novo jogador a partir dos inputs do usuário */
    function adicionarNovoJogador() {
        const nome = novoJogadorNomeInput.value.trim();
        if (!nome) return;
        renderizarJogador({ nome, icone: '👤' }, true);
        novoJogadorNomeInput.value = '';
        novoJogadorNomeInput.focus();
    }

    /** (LÓGICA ATUALIZADA) Lê apenas os jogadores MARCADOS para participar */
    function getJogadoresSelecionados() {
        const jogadores = [];
        document.querySelectorAll('#lista-jogadores .list-group-item').forEach(el => {
            const chkParticipar = el.querySelector('.chk-participar');
            if (chkParticipar.checked) {
                const nome = el.querySelector('.nome-jogador').textContent;
                const icone = el.querySelector('.icone-jogador').textContent;
                const isLevantador = el.querySelector('.chk-levantador').checked;
                jogadores.push({
                    nomeHTML: `<span class="me-2">${icone}</span> ${nome}`,
                    isLevantador
                });
            }
        });
        return jogadores;
    }

    /** Embaralha um array usando o algoritmo Fisher-Yates */
    function embaralharArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /** Função central que executa o sorteio com uma lista de jogadores */
    function executarLogicaSorteio(jogadores, tamanhoTime) {
        if (jogadores.length < tamanhoTime) {
            exibirMensagem('Não há jogadores suficientes para formar nem um time.', 'warning');
            return;
        }

        let levantadores = jogadores.filter(j => j.isLevantador);
        let outrosJogadores = jogadores.filter(j => !j.isLevantador);

        embaralharArray(levantadores);
        embaralharArray(outrosJogadores);

        let numeroDeTimes;
        const maxTimesPorJogadores = Math.floor(jogadores.length / tamanhoTime);

        if (levantadores.length > 0 && levantadores.length < maxTimesPorJogadores) {
            numeroDeTimes = levantadores.length;
        } else {
            numeroDeTimes = maxTimesPorJogadores;
        }
        
        if (numeroDeTimes === 0) {
            exibirMensagem('Não foi possível formar times com os jogadores selecionados.', 'info');
            return;
        }

        const times = Array.from({ length: numeroDeTimes }, () => []);
        
        // Distribui os levantadores e depois os outros jogadores
        for (let i = 0; i < numeroDeTimes; i++) {
            if (levantadores.length > 0) times[i].push(levantadores.pop());
        }

        const poolJogadores = [...outrosJogadores, ...levantadores];
        embaralharArray(poolJogadores);

        for (let i = 0; i < numeroDeTimes; i++) {
            while (times[i].length < tamanhoTime && poolJogadores.length > 0) {
                times[i].push(poolJogadores.pop());
            }
        }
        
        exibirTimes(times, poolJogadores);
        btnRefazerSorteio.disabled = false; // Habilita o botão de refazer
    }
    
    /** Inicia um novo sorteio a partir da seleção atual */
    function novoSorteio(tamanhoTime) {
        const jogadoresSelecionados = getJogadoresSelecionados();
        // Salva o estado para a função "Refazer"
        ultimoSorteioJogadores = JSON.parse(JSON.stringify(jogadoresSelecionados)); // Deep copy
        ultimoTamanhoTime = tamanhoTime;
        executarLogicaSorteio(jogadoresSelecionados, tamanhoTime);
    }

    /** Refaz o último sorteio com os mesmos jogadores */
    function refazerSorteio() {
        if (ultimoSorteioJogadores.length > 0) {
            // Reembaralha a mesma lista de jogadores
            executarLogicaSorteio(JSON.parse(JSON.stringify(ultimoSorteioJogadores)), ultimoTamanhoTime);
        }
    }

    /** Exibe os times e quem sobrou na tela */
    function exibirTimes(times, jogadoresSobrando) {
        timesContainer.innerHTML = '';
        times.forEach((time, index) => {
            const timeCard = document.createElement('div');
            timeCard.className = 'col-md-6 mb-4';
            let jogadoresHTML = '<ul class="list-group list-group-flush">';
            time.forEach(jogador => {
                const destaqueLevantador = jogador.isLevantador ? ' 👑<small class="text-muted"> (L)</small>' : '';
                jogadoresHTML += `<li class="list-group-item">${jogador.nomeHTML}${destaqueLevantador}</li>`;
            });
            jogadoresHTML += '</ul>';
            timeCard.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white"><strong>Time ${index + 1}</strong></div>
                    ${jogadoresHTML}
                </div>`;
            timesContainer.appendChild(timeCard);
        });

        if (jogadoresSobrando.length > 0) {
            const sobrasHTML = jogadoresSobrando.map(j => j.nomeHTML).join(', ');
            const sobrasAlert = document.createElement('div');
            sobrasAlert.className = 'col-12 mt-2';
            sobrasAlert.innerHTML = `<div class="alert alert-secondary"><strong>Ficaram de fora:</strong> ${sobrasHTML}</div>`;
            timesContainer.appendChild(sobrasAlert);
        }
    }

    /** Limpa tudo e restaura o estado inicial */
    function resetarTudo() {
        popularListaInicial();
        timesContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">Marque quem vai jogar, defina os levantadores e clique para sortear!</div></div>`;
        btnRefazerSorteio.disabled = true;
        ultimoSorteioJogadores = [];
        ultimoTamanhoTime = 0;
    }

    /** Exibe uma mensagem genérica na área de resultados */
    function exibirMensagem(mensagem, tipo = 'info') {
        timesContainer.innerHTML = `<div class="col-12"><div class="alert alert-${tipo}">${mensagem}</div></div>`;
        btnRefazerSorteio.disabled = true;
    }

    /** Marca ou desmarca todos os jogadores da lista */
    function selecionarTodos() {
        const checkboxes = document.querySelectorAll('.chk-participar');
        // Se algum estiver desmarcado, marca todos. Se todos estiverem marcados, desmarca todos.
        const deveMarcar = Array.from(checkboxes).some(cb => !cb.checked);
        checkboxes.forEach(cb => cb.checked = deveMarcar);
    }

    // --- EVENT LISTENERS ---
    btnSortearDuplas.addEventListener('click', () => novoSorteio(2));
    btnSortearQuartetos.addEventListener('click', () => novoSorteio(4));
    btnRefazerSorteio.addEventListener('click', refazerSorteio);
    btnResetar.addEventListener('click', resetarTudo);
    btnAdicionarJogador.addEventListener('click', adicionarNovoJogador);
    btnSelecionarTodos.addEventListener('click', selecionarTodos);
    novoJogadorNomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarNovoJogador();
    });
    listaJogadoresContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-remover')) {
            e.target.closest('.list-group-item').remove();
        }
    });

    // --- INICIALIZAÇÃO ---
    popularListaInicial();
});