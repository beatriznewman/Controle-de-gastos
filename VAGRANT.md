# 🐳 Guia do Vagrant - Controle de Gastos

Este guia explica como usar o Vagrant para executar o projeto completo de Controle de Gastos.

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
```

## 🏗️ Arquitetura das VMs

### VM1: Proxy (192.168.56.10)
- **Função**: Nginx como proxy reverso
- **Porta**: 80 → 8081 (host)
- **Rede**: Conecta com frontend via `proxy_net`

### VM2: Frontend (192.168.56.11)
- **Função**: React/Vite
- **Porta**: 5173
- **Redes**: 
  - `proxy_net` (com proxy)
  - `frontend_net` (com backend)

### VM3: Backend (192.168.57.11)
- **Função**: API Fastify + SQLite
- **Porta**: 3333
- **Rede**: `frontend_net` (com frontend)

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

- **Aplicação Principal**: http://localhost:8081
- **Frontend Direto**: http://192.168.56.11:5173
- **Backend API**: http://192.168.57.11:3333

## 🐛 Solução de Problemas

### VM não inicia
```bash
# Verificar logs do Vagrant
vagrant up --debug

# Verificar status do VirtualBox
vboxmanage list runningvms
```

### Serviços não respondem
```bash
# Verificar se os serviços estão rodando
vagrant ssh backend -c 'ps aux | grep node'
vagrant ssh frontend -c 'ps aux | grep node'

# Reiniciar serviços
vagrant ssh backend -c '/home/vagrant/start-backend.sh'
vagrant ssh frontend -c '/home/vagrant/start-frontend.sh'
```

### Problemas de rede
```bash
# Verificar conectividade entre VMs
vagrant ssh frontend -c 'ping 192.168.57.11'
vagrant ssh proxy -c 'ping 192.168.56.11'
```

### Banco de dados
```bash
# Recriar banco de dados
vagrant ssh backend -c 'cd /vagrant/backend && npm run migrate && npm run seed'

# Verificar banco
vagrant ssh backend -c 'cd /vagrant/backend && sqlite3 src/db/app-data.db ".tables"'
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
