const DATABASE = {
    "12345678909": {
        cpf: "123.456.789-09",
        nome: "João Silva Santos",
        nome_mae: "Maria Silva Santos",
        nascimento: "15/03/1985",
        sexo: "M",
        email: "joao.silva@email.com",
        data_obito: "",
        status_rf: "Regular",
        participacao_societaria: "25%",
        cbo: "2124-05",
        renda_presumida: "R$ 8.500,00",
        telefones: ["(11) 98765-4321", "(11) 3456-7890"],
        endereco: {
            tipo: "Residencial",
            logradouro: "Avenida Paulista",
            numero: "1578",
            complemento: "Apto 154",
            bairro: "Bela Vista",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01310-200"
        }
    }
};

// Classe principal para gerenciar o painel de consulta
class ConsultaPanel {
    constructor() {
        this.cpfInput = document.getElementById('cpf-search');
        this.searchButton = document.querySelector('.btn-search');
        this.dataValues = document.querySelectorAll('.data-value');
        this.actionButtons = document.querySelectorAll('.btn-action');
        this.initialize();
    }

    initialize() {
        // Inicializa os event listeners
        this.searchButton.addEventListener('click', () => this.realizarConsulta());
        this.cpfInput.addEventListener('input', (e) => this.formatarCPF(e.target));
        this.actionButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAction(e.target));
        });

        // Adiciona listener para tecla Enter no input
        this.cpfInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.realizarConsulta();
            }
        });
    }

    // Formata o CPF enquanto o usuário digita
    formatarCPF(input) {
        let cpf = input.value.replace(/\D/g, '');
        if (cpf.length > 11) cpf = cpf.slice(0, 11);

        if (cpf.length > 9) {
            cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        } else if (cpf.length > 6) {
            cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
        } else if (cpf.length > 3) {
            cpf = cpf.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
        }

        input.value = cpf;
    }

    // Valida o CPF
    validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;

        // Validação dos dígitos verificadores
        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    // Realiza a consulta do CPF
    async realizarConsulta() {
        const cpf = this.cpfInput.value.replace(/\D/g, '');

        if (!this.validarCPF(cpf)) {
            this.mostrarErro('CPF inválido. Por favor, verifique o número digitado.');
            return;
        }

        this.mostrarLoading(true);

        try {
            const response = await this.mockAPICall(cpf);
            this.preencherDados(response);
            this.salvarNoHistorico(cpf); // Salva no histórico após consulta bem-sucedida
            this.carregarHistorico();   // Atualiza o histórico exibido
        } catch (error) {
            this.mostrarErro('Erro ao realizar consulta. Tente novamente mais tarde.');
        } finally {
            this.mostrarLoading(false);
        }
    }

    // Simula uma chamada à API (substituir por chamada real)
    mockAPICall(cpf) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const dados = DATABASE[cpf];
                if (dados) {
                    resolve(dados);
                } else {
                    reject(new Error('CPF não encontrado na base de dados'));
                }
            }, 800);
        });
    }

    // Preenche os dados na interface
    preencherDados(data) {
        const dataMap = {
            'CPF': data.cpf,
            'Nome': data.nome,
            'Nome da Mãe': data.nome_mae,
            'Data de Nascimento': data.nascimento,
            'Sexo': data.sexo,
            'Email': data.email,
            'Data do Óbito': data.data_obito || '-',
            'Status Receita Federal': data.status_rf,
            'Participação Societária': data.participacao_societaria,
            'CBO': data.cbo,
            'Renda Presumida': data.renda_presumida,
            'Telefones': data.telefones.join(', '),
            'Tipo': data.endereco.tipo,
            'Logradouro': data.endereco.logradouro,
            'Número': data.endereco.numero,
            'Complemento': data.endereco.complemento,
            'Bairro': data.endereco.bairro,
            'Cidade': data.endereco.cidade,
            'Estado': data.endereco.estado,
            'CEP': data.endereco.cep
        };

        this.dataValues.forEach(element => {
            const label = element.previousElementSibling.textContent.replace(':', '');
            element.textContent = dataMap[label] || '-';
        });
    }

    // Gerencia ações dos botões
    handleAction(button) {
        const action = button.textContent.toLowerCase();
        switch (action) {
            case 'exportar pdf':
                this.exportarPDF();
                break;
            case 'imprimir':
                this.imprimir();
                break;
            case 'nova consulta':
                this.novaConsulta();
                break;
        }
    }

    exportarPDF() {
        alert('Funcionalidade de exportação para PDF em desenvolvimento');
    }

    imprimir() {
        window.print();
    }

    novaConsulta() {
        this.cpfInput.value = '';
        this.dataValues.forEach(element => {
            element.textContent = '-';
        });
        this.cpfInput.focus();
    }

    mostrarLoading(show) {
        this.searchButton.disabled = show;
        this.searchButton.textContent = show ? 'Consultando...' : 'Consultar';
    }

    mostrarErro(mensagem) {
        alert(mensagem); // Substituir por uma UI mais elegante
    }

    salvarNoHistorico(cpf) {
        const historico = JSON.parse(localStorage.getItem('historicoPesquisas')) || [];
        if (!historico.includes(cpf)) {
            historico.push(cpf);
            localStorage.setItem('historicoPesquisas', JSON.stringify(historico));
        }
    }

    carregarHistorico() {
        const historico = JSON.parse(localStorage.getItem('historicoPesquisas')) || [];
        const historicoContainer = document.getElementById('historico-lista');
        historicoContainer.innerHTML = '';

        if (historico.length === 0) {
            historicoContainer.innerHTML = '<li>Nenhuma pesquisa recente</li>';
            return;
        }

        historico.forEach(cpf => {
            const li = document.createElement('li');
            li.textContent = cpf;
            li.addEventListener('click', () => {
                this.cpfInput.value = cpf;
                this.realizarConsulta();
            });
            historicoContainer.appendChild(li);
        });
    }

    limparHistorico() {
        localStorage.removeItem('historicoPesquisas');
        this.carregarHistorico();
    }
}

// Inicializa o painel quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.consultaPanel = new ConsultaPanel();
    window.consultaPanel.carregarHistorico();

    // Adicionar evento para limpar histórico
    document.getElementById('limpar-historico').addEventListener('click', () => {
        window.consultaPanel.limparHistorico();
    });
});
