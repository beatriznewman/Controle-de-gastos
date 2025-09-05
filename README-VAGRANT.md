# 🚀 Ambiente de Desenvolvimento Cloud com Vagrant

Este projeto implementa uma arquitetura de 3 camadas usando Vagrant para simular um ambiente de produção com proxy reverso, frontend e backend em VMs separadas.

## 🏗️ Arquitetura

```
Internet → VM1 (Proxy/Nginx) → VM2 (Frontend/React) + VM3 (Backend/Node.js)
```

### VMs Configuradas:

- **VM1 - Proxy (192.168.56.10)**: Nginx como proxy reverso
  - Porta 8080 (host) → 80 (guest)
  - Redireciona requisições para frontend e backend

- **VM2 - Frontend (192.168.56.11)**: React + Vite (Node.js 20.x)
  - Porta 5173
  - Interface do usuário

- **VM3 - Backend (192.168.56.12)**: Node.js 20.x + Fastify + SQLite
  - Porta 3333
  - API REST para controle de gastos e metas

## 📋 Pré-requisitos

- [Vagrant](https://www.vagrantup.com/downloads) (versão 2.0+)
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) (versão 6.0+)
- Pelo menos 4GB de RAM disponível
- 10GB de espaço em disco

## 🚀 Inicialização Rápida

### Opção 1: Script Automático (Recomendado)
```bash
./start.sh
```

### Opção 2: Comandos Manuais
```bash
# Iniciar todas as VMs
vagrant up

# Verificar status
vagrant status

# Acessar a aplicação
# Abra: http://localhost:8080
```

## 🌐 Acesso à Aplicação

Após a inicialização, acesse:
- **Aplicação completa**: http://localhost:8080
- **Frontend direto**: http://192.168.56.11:5173
- **Backend direto**: http://192.168.56.12:3333

## 🔧 Comandos Úteis

### Gerenciamento de VMs
```bash
vagrant status              # Ver status das VMs
vagrant up                  # Iniciar todas as VMs
vagrant halt                # Parar todas as VMs
vagrant destroy             # Destruir todas as VMs
vagrant reload              # Recarregar configurações
```

### Acesso às VMs
```bash
vagrant ssh proxy           # Conectar na VM do proxy
vagrant ssh frontend        # Conectar na VM do frontend
vagrant ssh backend         # Conectar na VM do backend
```

### Monitoramento de Serviços
```bash
# Logs do frontend
vagrant ssh frontend -c 'sudo journalctl -u frontend -f'

# Logs do backend
vagrant ssh backend -c 'sudo journalctl -u backend -f'

# Logs do proxy
vagrant ssh proxy -c 'sudo journalctl -u nginx -f'

# Status dos serviços
vagrant ssh frontend -c 'sudo systemctl status frontend'
vagrant ssh backend -c 'sudo systemctl status backend'
vagrant ssh proxy -c 'sudo systemctl status nginx'
```

### Reiniciar Serviços
```bash
# Reiniciar frontend
vagrant ssh frontend -c 'sudo systemctl restart frontend'

# Reiniciar backend
vagrant ssh backend -c 'sudo systemctl restart backend'

# Reiniciar proxy
vagrant ssh proxy -c 'sudo systemctl restart nginx'
```

## 🔍 Troubleshooting

### Problema: VM não inicia
```bash
# Verificar logs do Vagrant
vagrant up --debug

# Verificar se VirtualBox está rodando
VBoxManage list runningvms
```

### Problema: Serviços não respondem
```bash
# Verificar se as VMs estão rodando
vagrant status

# Verificar conectividade entre VMs
vagrant ssh proxy -c 'ping 192.168.56.11'
vagrant ssh proxy -c 'ping 192.168.56.12'
```

### Problema: Porta 8080 ocupada
```bash
# Verificar processo usando a porta
sudo netstat -tulpn | grep :8080

# Parar processo ou alterar porta no Vagrantfile
```

### Problema: Banco de dados não inicializa
```bash
# Executar migrações manualmente
vagrant ssh backend -c 'cd /vagrant/backend && npm run migrate'
```

## 📁 Estrutura do Projeto

```
cloud/
├── Vagrantfile              # Configuração das VMs
├── start.sh                 # Script de inicialização
├── README-VAGRANT.md        # Este arquivo
├── frontend/                # Aplicação React
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── backend/                 # API Node.js
    ├── src/
    ├── package.json
    └── knexfile.ts
```

## 🔄 Fluxo de Requisições

1. **Usuário** acessa http://localhost:8080
2. **Proxy (Nginx)** recebe a requisição
3. **Proxy** redireciona para:
   - `/` → Frontend (192.168.56.11:5173)
   - `/api/*` → Backend (192.168.56.12:3333)
4. **Frontend** faz requisições para `/api/*`
5. **Proxy** encaminha para o Backend
6. **Backend** processa e retorna resposta
7. **Proxy** retorna resposta para o Frontend
8. **Frontend** exibe dados para o usuário

## 🛠️ Desenvolvimento

### Modificar Frontend
```bash
# Editar arquivos em ./frontend/
# As mudanças são sincronizadas automaticamente
# O Vite recarrega automaticamente
```

### Modificar Backend
```bash
# Editar arquivos em ./backend/
# As mudanças são sincronizadas automaticamente
# O tsx watch recarrega automaticamente
```

### Modificar Proxy
```bash
# Editar configuração do Nginx
vagrant ssh proxy -c 'sudo nano /etc/nginx/sites-available/default'
vagrant ssh proxy -c 'sudo systemctl reload nginx'
```

## 🧹 Limpeza

Para remover completamente o ambiente:
```bash
vagrant destroy -f
rm -rf .vagrant/
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs dos serviços
2. Confirme que todas as VMs estão rodando
3. Teste a conectividade entre as VMs
4. Verifique se as portas não estão ocupadas

---

**Desenvolvido para estudo de arquiteturas de rede e deploy de aplicações web** 🤖
