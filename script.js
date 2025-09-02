document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const btnSortearDuplas = document.getElementById('sortear-duplas');
    const btnSortearQuartetos = document.getElementById('sortear-quartetos');
    const btnResetar = document.getElementById('resetar');
    const timesContainer = document.getElementById('times-container');
    const listaJogadoresContainer = document.getElementById('lista-jogadores');
    
    // Seletores para adicionar novo jogador
    const btnAdicionarJogador = document.getElementById('btn-adicionar-jogador');
    const novoJogadorNomeInput = document.getElementById('novo-jogador-nome');
    const novoJogadorLevantadorCheckbox = document.getElementById('novo-jogador-levantador');

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
        { nome: "Lívia", icone: "🏐" }
    ];

    // --- FUNÇÕES ---

    /** Cria o elemento HTML para um jogador e o adiciona na lista */
    function renderizarJogador(jogador) {
        const jogadorId = `jogador-${jogador.nome.replace(/\s+/g, '-')}`;
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <label for="${jogadorId}" class="form-check-label d-flex align-items-center">
                <span class="me-2 icone-jogador">${jogador.icone}</span>
                <span class="nome-jogador">${jogador.nome}</span>
            </label>
            <div class="d-flex align-items-center">
                <div class="form-check form-switch me-3">
                    <input class="form-check-input" type="checkbox" role="switch" id="${jogadorId}">
                    <label class="form-check-label" for="${jogadorId}">Levantador</label>
                </div>
                <button class="btn btn-sm btn-outline-danger btn-remover">X</button>
            </div>
        `;
        listaJogadoresContainer.appendChild(item);
    }

    /** Popula a lista inicial de jogadores */
    function popularListaInicial() {
        listaJogadoresContainer.innerHTML = '';
        jogadoresIniciais.forEach(renderizarJogador);
    }
    
    /** Adiciona um novo jogador a partir dos inputs do usuário */
    function adicionarNovoJogador() {
        const nome = novoJogadorNomeInput.value.trim();
        if (!nome) {
            alert('Por favor, digite o nome do jogador.');
            return;
        }

        const novoJogador = {
            nome: nome,
            icone: '👤' // Ícone padrão para novos jogadores
        };
        
        renderizarJogador(novoJogador);
        
        // Marca como levantador se a caixa estiver marcada
        const novoJogadorId = `jogador-${nome.replace(/\s+/g, '-')}`;
        const novoCheckbox = document.getElementById(novoJogadorId);
        if (novoCheckbox && novoJogadorLevantadorCheckbox.checked) {
            novoCheckbox.checked = true;
        }

        // Limpa os campos
        novoJogadorNomeInput.value = '';
        novoJogadorLevantadorCheckbox.checked = false;
    }

    /** Lê a lista de jogadores do HTML, retornando um array de objetos */
    function getJogadoresDaLista() {
        const jogadores = [];
        const elementosJogadores = document.querySelectorAll('#lista-jogadores .list-group-item');
        elementosJogadores.forEach(el => {
            const nome = el.querySelector('.nome-jogador').textContent;
            const icone = el.querySelector('.icone-jogador').textContent;
            const checkbox = el.querySelector('.form-check-input');
            jogadores.push({
                nomeHTML: `<span class="me-2">${icone}</span> ${nome}`,
                isLevantador: checkbox.checked
            });
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

    /** Função principal que organiza e executa o sorteio */
    function realizarSorteio(tamanhoTime) {
        const todosJogadores = getJogadoresDaLista();

        if (todosJogadores.length < tamanhoTime) {
            exibirMensagem('Não há jogadores suficientes para formar nem um time.', 'warning');
            return;
        }

        let levantadores = todosJogadores.filter(j => j.isLevantador);
        let outrosJogadores = todosJogadores.filter(j => !j.isLevantador);

        embaralharArray(levantadores);
        embaralharArray(outrosJogadores);

        const numeroDeTimes = Math.floor(todosJogadores.length / tamanhoTime);
        const times = Array.from({ length: numeroDeTimes }, () => []);
        
        // 1. Distribui os levantadores
        for (let i = 0; i < numeroDeTimes; i++) {
            if (levantadores.length > 0) times[i].push(levantadores.pop());
        }

        // 2. Preenche o resto com outros jogadores
        const poolJogadores = [...outrosJogadores, ...levantadores]; // Junta o que sobrou
        embaralharArray(poolJogadores);

        for (let i = 0; i < numeroDeTimes; i++) {
            while (times[i].length < tamanhoTime && poolJogadores.length > 0) {
                times[i].push(poolJogadores.pop());
            }
        }
        
        exibirTimes(times, poolJogadores);
    }

    /** (VERSÃO CORRIGIDA E ROBUSTA) Exibe os times e quem sobrou na tela */
    function exibirTimes(times, jogadoresSobrando) {
        timesContainer.innerHTML = ''; // Limpa a área antes de exibir

        const timesValidos = times.filter(time => time.length > 0);

        if (timesValidos.length === 0) {
            exibirMensagem('Não foi possível formar nenhum time completo.', 'info');
        } else {
            timesValidos.forEach((time, index) => {
                const timeCard = document.createElement('div');
                timeCard.className = 'col-lg-6 mb-4';
                let jogadoresHTML = '<ul class="list-group list-group-flush">';
                time.forEach(jogador => {
                    const destaqueLevantador = jogador.isLevantador ? ' 👑<small class="text-muted"> (Levantador)</small>' : '';
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
        }

        if (jogadoresSobrando.length > 0) {
            const sobrasHTML = jogadoresSobrando.map(j => j.nomeHTML).join(', ');
            const sobrasAlert = document.createElement('div');
            sobrasAlert.className = 'col-12 mt-3';
            sobrasAlert.innerHTML = `<div class="alert alert-secondary"><strong>Ficaram de fora:</strong> ${sobrasHTML}</div>`;
            timesContainer.appendChild(sobrasAlert);
        }
    }

    /** Limpa os resultados e reseta o estado da UI */
    function resetarSorteio() {
        popularListaInicial();
        timesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">Selecione os levantadores e clique em um dos botões de sorteio!</div>
            </div>`;
    }

    /** Exibe uma mensagem genérica na área de resultados */
    function exibirMensagem(mensagem, tipo = 'info') {
        timesContainer.innerHTML = `<div class="col-12"><div class="alert alert-${tipo}">${mensagem}</div></div>`;
    }

    // --- EVENT LISTENERS ---
    btnSortearDuplas.addEventListener('click', () => realizarSorteio(2));
    btnSortearQuartetos.addEventListener('click', () => realizarSorteio(4));
    btnResetar.addEventListener('click', resetarSorteio);
    btnAdicionarJogador.addEventListener('click', adicionarNovoJogador);
    novoJogadorNomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarNovoJogador();
    });

    // Event listener para remover jogadores (usando delegação de eventos)
    listaJogadoresContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('btn-remover')) {
            e.target.closest('.list-group-item').remove();
        }
    });

    // --- INICIALIZAÇÃO ---
    popularListaInicial();
});