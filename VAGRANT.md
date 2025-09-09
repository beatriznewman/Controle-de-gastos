# 🐳 Guia do Vagrant - Controle de Gastos

Este guia explica como usar o Vagrant para executar o projeto completo de Controle de Gastos com arquitetura de rede isolada.

## 📋 Pré-requisitos

1. **Vagrant** (versão 2.0+)
   - Download: https://www.vagrantup.com/downloads
   - Verificar instalação: `vagrant --version`

2. **VirtualBox** (versão 6.0+)
   - Download: https://www.virtualbox.org/wiki/Downloads
   - Verificar instalação: `vboxmanage --version`

## 🚀 Inicialização Rápida

```bash
# Clonar o repositório (se ainda não fez)
git clone <seu-repositorio>
cd Controle-de-gastos

# Iniciar tudo com um comando
vagrant up

# Acompanhar progresso (opcional)
vagrant up --debug  # Para logs detalhados
```

⏱️ **Tempo esperado**: 15-20 minutos na primeira execução
💾 **RAM necessária**: Mínimo 4GB livres (8GB total recomendados)

## 🏗️ Arquitetura de Rede Isolada

### VM1: Proxy Reverso (192.168.56.10)
- **Função**: Nginx como proxy reverso
- **Porta**: 80 → 8081 (host)
- **Conectividade**: 
  - ✅ Host (localhost:8081)
  - ✅ Internet (NAT)
  - ✅ Frontend (192.168.56.11)

### VM2: Frontend (192.168.56.11 + 192.168.57.10)
- **Função**: React/Vite dev server
- **Porta**: 5173
- **Conectividade**:
  - ✅ Proxy (192.168.56.10)
  - ✅ Backend (192.168.57.11)
  - ❌ Internet (removida após provisionamento)

### VM3: Backend (192.168.57.11)
- **Função**: API Fastify + SQLite
- **Porta**: 3333
- **Conectividade**:
  - ✅ Frontend (192.168.57.10)
  - ❌ Proxy (isolado)
  - ❌ Internet (removida após provisionamento)

## 🔧 Comandos Úteis

### Gerenciamento das VMs
```bash
# Ver status de todas as VMs
vagrant status

# Iniciar todas as VMs
vagrant up

# Parar todas as VMs
vagrant halt

# Destruir todas as VMs (remove completamente)
vagrant destroy

# Recriar uma VM específica
vagrant destroy proxy && vagrant up proxy
```

### Acesso às VMs
```bash
# Conectar via SSH
vagrant ssh proxy
vagrant ssh frontend
vagrant ssh backend

# Executar comando sem conectar
vagrant ssh backend -c 'npm run migrate'
```

### Logs e Monitoramento
```bash
# Ver logs do backend
vagrant ssh backend -c 'tail -f /var/log/backend.log'

# Ver logs do frontend
vagrant ssh frontend -c 'tail -f /var/log/frontend.log'

# Ver logs do nginx
vagrant ssh proxy -c 'tail -f /var/log/nginx/access.log'
```

## 🌐 Acessos

Após `vagrant up`, você pode acessar:

- **Aplicação Principal**: http://localhost:8081 (**ÚNICO ACESSO PERMITIDO**)

⚠️ **IMPORTANTE**: Acessos diretos às VMs foram **REMOVIDOS** por segurança:
- ❌ `http://192.168.56.11:5173` (Frontend direto - BLOQUEADO)
- ❌ `http://192.168.57.11:3333` (Backend direto - BLOQUEADO)

## 🔒 Isolamento de Rede

### Processo de Provisionamento Detalhado

O Vagrant executa 3 fases sequenciais em cada VM:

#### **Fase 1: Instalação de Dependências (COM Internet)**
- 📦 **Proxy**: Instala e configura Nginx
- 📦 **Frontend**: Instala Node.js 22 + dependências npm + configura serviço systemd
- 📦 **Backend**: Instala Node.js 22 + dependências npm + migrate/seed DB + configura serviço systemd

#### **Fase 2: Preparação do Isolamento**
- 🔒 **Proxy**: Mantém NAT (gateway de acesso)
- 🔒 **Frontend**: Cria script de isolamento (não aplica ainda)
- 🔒 **Backend**: Cria script de isolamento (não aplica ainda)

#### **Fase 3: Finalização (Inicia Serviços)**
- 🚀 **Todas VMs**: Inicia serviços com rede ainda ativa
- ✅ **Resultado**: Sistema funcionando SEM isolamento aplicado

### 🔒 Aplicar Isolamento Manual

Após `vagrant up`, execute para isolamento completo:
```bash
vagrant ssh frontend -c 'sudo /home/vagrant/apply_network_isolation.sh'
vagrant ssh backend -c 'sudo /home/vagrant/apply_network_isolation.sh'
```

### ⚙️ Configurações SSH Otimizadas

Para evitar timeouts durante o provisionamento:
```ruby
config.ssh.connect_timeout = 300      # 5 minutos para conectar
config.vm.boot_timeout = 1200         # 20 minutos para boot
config.vm.graceful_halt_timeout = 300 # 5 minutos para shutdown
```

### Verificar Isolamento Completo

```bash
# Teste de Internet (deve falhar em VM2 e VM3)
vagrant ssh frontend -c 'ping -c 2 8.8.8.8'  # ❌ Deve falhar
vagrant ssh backend -c 'ping -c 2 8.8.8.8'   # ❌ Deve falhar
vagrant ssh proxy -c 'ping -c 2 8.8.8.8'     # ✅ Deve funcionar

# Teste de Comunicação Interna (deve funcionar)
vagrant ssh frontend -c 'ping -c 2 192.168.57.11'  # ✅ Frontend → Backend
vagrant ssh proxy -c 'ping -c 2 192.168.56.11'     # ✅ Proxy → Frontend

# Teste de Acesso do Host (apenas proxy deve funcionar)
# No seu browser/terminal do host:
# ✅ http://localhost:8081      (através do proxy)
# ❌ http://192.168.56.11:5173  (direto frontend - deve falhar)
# ❌ http://192.168.57.11:3333  (direto backend - deve falhar)
```

## 🐛 Solução de Problemas

### 🚨 Timeouts SSH
```bash
# Se o Vagrant trava em "timeout during server version negotiating"
vagrant halt && vagrant destroy -f
vagrant up  # Tentar novamente

# Verificar recursos do sistema
# Certifique-se de ter 4GB+ RAM livres
```

### 🔧 VM não inicia
```bash
# Verificar logs detalhados
vagrant up --debug

# Verificar VMs existentes no VirtualBox
vboxmanage list runningvms
vboxmanage list vms

# Limpar VMs orfãs
vagrant global-status --prune
```

### 🌐 Problemas de rede
```bash
# Verificar conectividade entre VMs
vagrant ssh frontend -c 'ping -c 2 192.168.57.11'  # Frontend → Backend
vagrant ssh proxy -c 'ping -c 2 192.168.56.11'     # Proxy → Frontend

# Verificar configuração de rede
vagrant ssh frontend -c 'ip addr show'
vagrant ssh backend -c 'ip addr show'
```

### ⚙️ Serviços não respondem
```bash
# Verificar status dos serviços
vagrant ssh backend -c 'systemctl status backend'
vagrant ssh frontend -c 'systemctl status frontend'

# Reiniciar serviços manualmente
vagrant ssh backend -c 'sudo systemctl restart backend'
vagrant ssh frontend -c 'sudo systemctl restart frontend'

# Verificar processos Node.js
vagrant ssh backend -c 'ps aux | grep node'
vagrant ssh frontend -c 'ps aux | grep node'
```

### 🗄️ Problemas no banco de dados
```bash
# Recriar banco de dados
vagrant ssh backend -c 'cd /home/vagrant/backend-local && npm run migrate && npm run seed'

# Verificar banco SQLite
vagrant ssh backend -c 'cd /home/vagrant/backend-local && sqlite3 src/db/app-data.db ".tables"'

# Ver logs do backend
vagrant ssh backend -c 'tail -f /var/log/backend.log'
```

### 🔄 Reset completo
```bash
# Se nada funcionar, reset completo:
vagrant destroy -f
vagrant box update ubuntu/focal64
vagrant up
```

## 🔄 Desenvolvimento

### Modificar código
O código é sincronizado automaticamente entre host e VMs via `/vagrant`. 
Mudanças no código são refletidas automaticamente.

### Adicionar dependências
```bash
# Backend
vagrant ssh backend -c 'cd /vagrant/backend && npm install nova-dependencia'

# Frontend
vagrant ssh frontend -c 'cd /vagrant/frontend && npm install nova-dependencia'
```

### Hot Reload
- **Backend**: Reinicia automaticamente com `tsx watch`
- **Frontend**: Recarrega automaticamente com Vite

## 📊 Monitoramento de Recursos

```bash
# Ver uso de CPU e memória
vagrant ssh backend -c 'htop'
vagrant ssh frontend -c 'htop'

# Ver espaço em disco
vagrant ssh backend -c 'df -h'
```

## 🧹 Limpeza

```bash
# Parar e remover todas as VMs
vagrant destroy

# Limpar cache do Vagrant
vagrant box prune

# Limpar cache do VirtualBox
vboxmanage list vms
vboxmanage unregistervm <vm-name> --delete
```

## 📝 Notas Importantes

1. **Primeira execução**: Pode demorar 10-15 minutos para baixar a imagem Ubuntu e instalar dependências
2. **Memória**: 
   - Proxy: 2GB RAM
   - Backend: 3GB RAM  
   - Frontend: 3GB RAM
   - Total: ~8GB RAM
3. **Rede**: As VMs usam redes privadas do VirtualBox
4. **Persistência**: Dados do banco são mantidos entre reinicializações
5. **Logs**: Logs são salvos em `/var/log/` dentro de cada VM
