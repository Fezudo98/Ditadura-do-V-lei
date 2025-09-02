// Aguarda o documento HTML ser completamente carregado para executar o script
document.addEventListener('DOMContentLoaded', () => {

    // Pega as referências dos botões e da área de exibição dos times
    const btnSortearDuplas = document.getElementById('sortear-duplas');
    const btnSortearQuartetos = document.getElementById('sortear-quartetos');
    const btnResetar = document.getElementById('resetar');
    const timesContainer = document.getElementById('times-container');

    // Adiciona os "escutadores" de eventos de clique nos botões
    btnSortearDuplas.addEventListener('click', () => realizarSorteio(2));
    btnSortearQuartetos.addEventListener('click', () => realizarSorteio(4));
    btnResetar.addEventListener('click', resetarSorteio);

    /**
     * Função principal que realiza o sorteio.
     * @param {number} tamanhoTime - O número de jogadores por time (2 ou 4).
     */
    function realizarSorteio(tamanhoTime) {
        const todosJogadores = getJogadoresDaLista();

        if (todosJogadores.length < tamanhoTime) {
            exibirMensagem('Não há jogadores suficientes para formar nem um time.', 'warning');
            return;
        }

        // Separa os jogadores em duas listas: levantadores e os demais
        let levantadores = todosJogadores.filter(j => j.isLevantador);
        let outrosJogadores = todosJogadores.filter(j => !j.isLevantador);

        // Embaralha as duas listas para garantir a aleatoriedade
        embaralharArray(levantadores);
        embaralharArray(outrosJogadores);

        // Calcula quantos times podem ser formados
        const numeroDeTimes = Math.floor(todosJogadores.length / tamanhoTime);
        const times = [];
        for (let i = 0; i < numeroDeTimes; i++) {
            times.push([]);
        }

        // 1. Distribui os levantadores, um para cada time se possível
        for (let i = 0; i < numeroDeTimes; i++) {
            if (levantadores.length > 0) {
                // Pega o último levantador da lista embaralhada e o adiciona ao time
                const levantador = levantadores.pop();
                times[i].push(levantador);
            }
        }

        // Junta o que sobrou dos levantadores com os outros jogadores
        const poolJogadores = [...outrosJogadores, ...levantadores];
        embaralharArray(poolJogadores); // Embaralha o pool combinado

        // 2. Preenche o restante das vagas nos times
        for (let i = 0; i < numeroDeTimes; i++) {
            while (times[i].length < tamanhoTime && poolJogadores.length > 0) {
                const jogador = poolJogadores.pop();
                times[i].push(jogador);
            }
        }
        
        // O que sobrou no pool são os jogadores que ficaram de fora
        const jogadoresSobrando = poolJogadores;

        exibirTimes(times, jogadoresSobrando);
    }

    /**
     * Lê a lista de jogadores do HTML.
     * @returns {Array<Object>} Uma lista de objetos, onde cada objeto representa um jogador.
     */
    function getJogadoresDaLista() {
        const jogadores = [];
        const elementosJogadores = document.querySelectorAll('#lista-jogadores .list-group-item');

        elementosJogadores.forEach(el => {
            const label = el.querySelector('label');
            const checkbox = el.querySelector('.form-check-input');

            jogadores.push({
                nomeHTML: label.innerHTML, // Pega o nome com o ícone
                isLevantador: checkbox.checked
            });
        });

        return jogadores;
    }

    /**
     * Embaralha os itens de um array usando o algoritmo Fisher-Yates.
     * @param {Array} array - O array a ser embaralhado.
     */
    function embaralharArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Exibe os times sorteados na tela.
     * @param {Array<Array<Object>>} times - Um array contendo os times (que são arrays de jogadores).
     * @param {Array<Object>} jogadoresSobrando - Um array com os jogadores que ficaram de fora.
     */
    function exibirTimes(times, jogadoresSobrando) {
        timesContainer.innerHTML = ''; // Limpa a área de resultados

        if (times.length === 0) {
            exibirMensagem('Não foi possível formar times.', 'info');
            return;
        }

        times.forEach((time, index) => {
            const timeCard = document.createElement('div');
            timeCard.className = 'col-lg-6 mb-4'; // Em telas grandes, mostra 2 times por linha

            let jogadoresHTML = '<ul class="list-group list-group-flush">';
            time.forEach(jogador => {
                const levantadorIcon = jogador.isLevantador ? ' 👑<small class="text-muted"> (Levantador)</small>' : '';
                jogadoresHTML += `<li class="list-group-item">${jogador.nomeHTML}${levantadorIcon}</li>`;
            });
            jogadoresHTML += '</ul>';

            timeCard.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white">
                        <strong>Time ${index + 1}</strong>
                    </div>
                    ${jogadoresHTML}
                </div>
            `;
            timesContainer.appendChild(timeCard);
        });
        
        // Se houver jogadores sobrando, exibe um alerta
        if(jogadoresSobrando.length > 0) {
            const sobrasHTML = jogadoresSobrando.map(j => j.nomeHTML).join(', ');
            exibirMensagem(`<strong>Ficaram de fora:</strong> ${sobrasHTML}`, 'secondary');
        }
    }

    /**
     * Limpa a área de resultados e desmarca os levantadores.
     */
    function resetarSorteio() {
        // Restaura a mensagem inicial na área de times
        timesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    Os times sorteados aparecerão aqui!
                </div>
            </div>`;
        
        // Desmarca todos os checkboxes de levantador
        const checkboxes = document.querySelectorAll('#lista-jogadores .form-check-input');
        checkboxes.forEach(cb => cb.checked = false);
    }
    
    /**
     * Função auxiliar para exibir mensagens na área de resultados.
     * @param {string} mensagem - A mensagem a ser exibida.
     * @param {string} tipo - O tipo do alerta Bootstrap (e.g., 'info', 'warning', 'danger').
     */
    function exibirMensagem(mensagem, tipo = 'info') {
        timesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-${tipo}">
                    ${mensagem}
                </div>
            </div>`;
    }
});