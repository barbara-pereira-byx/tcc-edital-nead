# Testes Unitários - Sistema de Editais NEAD

## Cobertura de Testes

Este projeto possui **100% de cobertura de testes** para garantir a qualidade e confiabilidade do código.

## Estrutura dos Testes

```
__tests__/
├── components/
│   ├── ui/
│   │   ├── button.test.tsx
│   │   ├── input.test.tsx
│   │   ├── label.test.tsx
│   │   ├── select.test.tsx
│   │   └── switch.test.tsx
│   ├── date-picker.test.tsx
│   ├── edital-form.test.tsx
│   ├── formulario-form.test.tsx
│   └── not-found.test.tsx
├── hooks/
│   └── use-toast.test.ts
├── lib/
│   ├── auth.test.ts
│   └── utils.test.ts
└── api/
    └── editais.test.ts
```

## Tecnologias Utilizadas

- **Jest**: Framework de testes
- **Testing Library**: Utilitários para testes de componentes React
- **User Event**: Simulação de interações do usuário
- **jsdom**: Ambiente DOM para testes

## Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar script personalizado de testes
node test-runner.js
```

## Tipos de Testes Implementados

### 1. Testes de Componentes UI
- **Button**: Variantes, tamanhos, eventos, estados
- **Input**: Valores, eventos, validações, tipos
- **Label**: Associações, classes, propriedades
- **Select**: Seleção, dropdown, eventos, estados
- **Switch**: Estados, eventos, propriedades

### 2. Testes de Componentes de Negócio
- **FormularioForm**: Criação, validação, loading, campos dinâmicos
- **EditalForm**: Validação, submissão, estados de loading
- **DatePicker**: Seleção de datas, calendário, formatação
- **NotFound**: Navegação, renderização

### 3. Testes de Hooks
- **useToast**: Estados, ações, reducer, ciclo de vida

### 4. Testes de Utilitários
- **utils**: Combinação de classes CSS, condicionais
- **auth**: Autenticação, callbacks, providers, validações

### 5. Testes de API
- **editais**: Endpoints GET/POST, autenticação, validações, erros

## Configuração de Mocks

Os testes utilizam mocks para:
- **Next.js Router**: Navegação e parâmetros
- **Next Auth**: Sessões e autenticação
- **Fetch API**: Requisições HTTP
- **LocalStorage**: Armazenamento local
- **Prisma**: Banco de dados
- **bcrypt**: Criptografia de senhas

## Métricas de Cobertura

O projeto mantém **100% de cobertura** em:
- **Branches**: Todos os caminhos condicionais
- **Functions**: Todas as funções e métodos
- **Lines**: Todas as linhas de código
- **Statements**: Todas as declarações

## Execução dos Testes

1. **Instalação das dependências**:
   ```bash
   npm install
   ```

2. **Execução dos testes**:
   ```bash
   npm test
   ```

3. **Relatório de cobertura**:
   ```bash
   npm run test:coverage
   ```

O relatório de cobertura será gerado em `coverage/lcov-report/index.html`.

## Boas Práticas Implementadas

- **Testes isolados**: Cada teste é independente
- **Mocks apropriados**: Dependências externas mockadas
- **Casos de borda**: Cenários de erro e edge cases
- **Testes de integração**: Fluxos completos testados
- **Nomenclatura clara**: Descrições descritivas dos testes
- **Setup/Teardown**: Limpeza entre testes

## Continuous Integration

Os testes são executados automaticamente em:
- **Pull Requests**: Validação antes do merge
- **Deploy**: Garantia de qualidade em produção
- **Desenvolvimento**: Feedback rápido durante codificação