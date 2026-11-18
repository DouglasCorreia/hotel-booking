# Refatoração da organização da mock-api

> Tipo: PRD de feature · Data: 2026-11-17
> **Status:** Implementada

## Objetivo

Centralizar instalação, dependências, comandos e documentação na raiz do projeto. Manter `mock-api/` exclusivamente para os dados da simulação, preservando a integração e o comportamento atual da API.

Decisões confirmadas: preservar o backend existente e eliminar os tipos redundantes, aproveitando os contratos utilizados pela aplicação.

## Alterações previstas

### Spec 01 — Instalação centralizada

- Incorporar `json-server` às dependências de desenvolvimento da raiz, preservando a versão compatível com o servidor atual.
- Atualizar o lockfile principal para permitir instalação reproduzível por uma única instalação na raiz.
- Remover o manifesto, lockfile e instalação de dependências internos da mock-api somente após validar a instalação centralizada.
- Manter os demais pacotes e comandos do projeto funcionando.

**Aceite:** uma cópia limpa do projeto permite executar frontend e API após instalar as dependências exclusivamente na raiz.

### Spec 02 — Separação entre servidor, dados e contratos

- Realocar o servidor para `scripts/mock-api.mjs`, adequando sua execução ao formato de módulo sem alterar seu comportamento.
- Manter em `mock-api/` somente os dados iniciais e o banco transitório gerado durante a execução.
- Resolver os caminhos dos dados pela localização do servidor, independentemente do diretório de execução.
- Atualizar o comando principal da API para a nova localização, preservando argumentos e variáveis de ambiente.
- Remover o `types.ts` redundante. Manter os schemas Zod e os tipos derivados existentes nas features como contratos utilizados pela aplicação.
- Revisar importações e referências aos arquivos realocados ou removidos.
- Preservar os dados iniciais e o banco transitório existente durante a reorganização. Reiniciar a API continuará restaurando o banco, conforme seu funcionamento atual.

**Aceite:** a API executa sem arquivos de infraestrutura dentro de `mock-api/`, e a aplicação continua consultando hotéis, quartos e reservas pelos mesmos contratos.

### Spec 03 — Configuração e documentação unificadas

- Incorporar ao README principal a documentação útil da API: endpoints, configuração, argumentos, simulações e limitações.
- Remover o README e o arquivo de exclusões internos após incorporar suas responsabilidades à raiz.
- Garantir que o banco transitório continue ignorado pelo Git e que os dados iniciais permaneçam versionáveis.
- Ajustar lint, formatação e referências documentais à nova organização.
- Preservar o PRD original como histórico; registrar esta reorganização em um PRD separado.

**Aceite:** o README principal permite configurar, executar e testar a aplicação sem instruções de instalação interna ou referências operacionais aos caminhos antigos.

## Validação

- Conferir que os dados iniciais mantêm o mesmo conteúdo.
- Verificar instalação centralizada e inicialização da API sem dependências internas.
- Validar execução do servidor a partir de outro diretório, usando seu caminho absoluto.
- Confirmar autocomplete sem acentos, paginação, detalhes, quartos e criação/consulta de reservas.
- Conferir configurações de porta, endereço, atraso e falhas simuladas.
- Executar TypeScript, lint, formatação, testes existentes e build.
- Executar os testes de navegador, incluindo reserva, confirmação após refresh e recuperação de falhas.
- Buscar referências antigas e verificar que o banco transitório permanece ignorado pelo Git.

## Limites e ordem de execução

Não haverá mudanças nas telas, regras de reserva, endpoints, formatos das respostas ou estratégia de estado. Também não serão adicionados backend real, persistência permanente ou atualização de versão principal do json-server.

Executar nesta ordem: centralizar dependências → realocar servidor e atualizar caminhos → remover redundâncias → consolidar documentação e configurações → validar a entrega.

## Validação da entrega

- Dependência `json-server` 0.17.4 centralizada na raiz e instalação limpa por `npm ci` verificada em diretório temporário isolado.
- Servidor executado fora do diretório do projeto, preservando flags, ambiente, autocomplete, paginação, detalhes, quartos, reservas, reset e simulação de falhas/atraso.
- 26 testes unitários e de integração aprovados, incluindo três novos testes do servidor.
- Cinco testes Playwright aprovados com inicialização da API pelo comando atualizado da raiz.
- TypeScript, ESLint, Prettier e build aprovados; revisão independente sem problemas importantes.
- Dados iniciais e banco transitório anterior à refatoração preservados, com verificação SHA-256 e restauração após os testes de navegador.
- `mock-api/` contém somente os dois arquivos de dados; o banco transitório continua ignorado e o seed permanece versionável.
- O PRD original foi preservado como histórico.

O npm reportou 16 vulnerabilidades de severidade alta na árvore de dependências durante a instalação, relacionadas a um alerta transitivo de `picomatch`. Atualizações de segurança da árvore não fazem parte desta reorganização; não foi aplicado ajuste automático ou atualização de versão principal.
