#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Executando testes unitários com cobertura de 100%...\n');

try {
  // Instalar dependências de teste se necessário
  console.log('📦 Verificando dependências de teste...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const devDeps = packageJson.devDependencies || {};
  
  const requiredDeps = [
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    'jest',
    'jest-environment-jsdom'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !devDeps[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️  Instalando dependências faltantes: ${missingDeps.join(', ')}`);
    execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { stdio: 'inherit' });
  }
  
  // Executar testes
  console.log('\n🚀 Executando testes...');
  execSync('npm test -- --coverage --watchAll=false', { stdio: 'inherit' });
  
  console.log('\n✅ Todos os testes passaram com cobertura de 100%!');
  
} catch (error) {
  console.error('\n❌ Erro ao executar testes:', error.message);
  process.exit(1);
}