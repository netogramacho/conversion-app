# Conversion App

Aplicação Angular para monitoramento de cotações de moedas estrangeiras em relação ao Real Brasileiro.

## Descrição

Sistema desenvolvido em Angular 21 que consome a API AwesomeAPI para exibir cotações atualizadas de moedas (Dólar Canadense, Peso Argentino e Libra Esterlina) com refresh automático a cada 3 minutos.

### Características Técnicas Principais

- Visualização em tempo real de cotações de moedas
- Atualização automática periódica (TTL: 180 segundos)
- Exibição de valores, variação percentual e timestamp
- Mecanismo de reload manual em caso de erro
- Arquitetura baseada em Standalone Components
- Gerenciamento de estado com Angular Signals
- Interceptor HTTP para configuração de requisições

## Stack

- Angular 21.1.0
- TypeScript 5.9.2
- RxJS 7.8.0
- SCSS
- Vitest 4.0.8

## Requisitos do Sistema

- Node.js versão 18 ou superior
- npm 11.6.2 ou superior
- Angular CLI 21.1.1

## Instalação

Clone o repositório:

```bash
git clone https://github.com/netogramacho/conversion-app.git
cd conversion-app
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Edite o arquivo `src/environments/environment.ts` conforme necessário:

```typescript
export const environment = {
  production: false,
  quoteApi: {
    baseUrl: 'https://economia.awesomeapi.com.br/json/last/',
    apiKey: '' // Opcional: API key se necessário
  }
};
```

## Execução

### Ambiente de Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200/`.

### Build de Produção

```bash
npm run build
```

Os artefatos compilados serão gerados no diretório `dist/`.

### Build com Watch Mode

```bash
npm run watch
```

## Testes

Execute os testes unitários:

```bash
npm test
```

A suíte de testes utiliza Vitest como test runner.

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── conversion.api.ts           # Serviço de comunicação com API
│   ├── domain/
│   │   ├── quote.ts                    # Interface de cotação
│   │   └── quoteResponse.ts            # Interface de resposta da API
│   ├── home/
│   │   └── home.component.ts           # Componente principal
│   ├── interceptors/
│   │   └── quote-api.interceptor.ts    # Interceptor HTTP
│   ├── service/
│   │   └── conversion.service.ts       # Lógica de negócio
│   ├── shared/
│   │   └── components/
│   │       ├── card/                   # Componente de exibição de cotação
│   │       └── header-component/       # Componente de cabeçalho
│   ├── app.config.ts                   # Configuração da aplicação
│   └── app.routes.ts                   # Definição de rotas
├── environments/                        # Configurações de ambiente
└── assets/                             # Recursos estáticos
```

## Arquitetura

### Padrões de Design

- **Standalone Components**: Eliminação de NgModules para arquitetura moderna
- **Signals**: Gerenciamento reativo de estado
- **Dependency Injection**: Injeção de dependências nativa do Angular
- **RxJS Operators**: Operadores reativos para controle de fluxo assíncrono
- **HTTP Interceptors**: Centralização de configuração de requisições
- **Timer-based Refresh**: Atualização periódica automática

### Fluxo de Execução

1. Inicialização do `ConversionService` pelo `HomeComponent`
2. Configuração de timer RxJS com intervalo de 3 minutos
3. Requisição HTTP à API AwesomeAPI via `ConversionApi`
4. Aplicação do interceptor `QuoteApiInterceptor` (se necessário)
5. Mapeamento da resposta para modelo `IQuote`
6. Atualização dos signals com novos dados
7. Renderização automática da UI via signal binding

### Integração com API Externa

**Endpoint**: `https://economia.awesomeapi.com.br/json/last/CAD-BRL,ARS-BRL,GBP-BRL`

**Método**: GET

**Parâmetros de Moedas**:
- CAD-BRL: Dólar Canadense para Real
- ARS-BRL: Peso Argentino para Real  
- GBP-BRL: Libra Esterlina para Real

**Documentação**: https://docs.awesomeapi.com.br/api-de-moedas
