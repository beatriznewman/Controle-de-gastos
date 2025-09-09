# -*- mode: ruby -*-
# vi: set ft=ruby :

# ========================================================================
# CONTROLE DE GASTOS - VAGRANTFILE
# ========================================================================
# Arquitetura de 3 VMs com isolamento progressivo de rede:
# 
# VM1 (Proxy):    NAT + Acesso Host + Rede Interna com Frontend
# VM2 (Frontend): Rede com Proxy + Rede com Backend (NAT removida na Fase 2)
# VM3 (Backend):  Apenas Rede com Frontend (NAT removida na Fase 2)
#
# FASES DE PROVISIONAMENTO:
# 1. Instalação: Todas VMs com NAT para baixar dependências
# 2. Configuração: Remove NAT das VMs 2 e 3 via netplan
# 3. Finalização: Reinicia serviços com nova configuração de rede
# ========================================================================

Vagrant.configure("2") do |config|
  # ========================================================================
  # CONFIGURAÇÕES GLOBAIS
  # ========================================================================
  
  # Imagem base Ubuntu 20.04 LTS
  config.vm.box = "ubuntu/focal64"
  
  # Configurações SSH otimizadas para evitar timeouts
  config.ssh.insert_key = false        # Usa chave SSH padrão do Vagrant
  config.ssh.forward_agent = false     # Desabilita forward de SSH agent
  config.ssh.connect_timeout = 300     # Timeout de conexão SSH (5 min)
  
  # Timeouts generosos para provisionamento longo
  config.vm.boot_timeout = 1200        # Timeout de boot (20 min)
  config.vm.graceful_halt_timeout = 300 # Timeout para shutdown graceful (5 min)

  # Mensagem exibida após provisionamento completo
  config.vm.post_up_message = <<-MSG
🎉 Projeto no ar:
  Aplicação:      http://localhost:8081 (ÚNICO ACESSO)
  
🔒 Para aplicar ISOLAMENTO COMPLETO DE REDE, execute:
  vagrant ssh frontend -c 'sudo /home/vagrant/apply_network_isolation.sh'
  vagrant ssh backend -c 'sudo /home/vagrant/apply_network_isolation.sh'
  
⚠️ APÓS ISOLAMENTO: Apenas localhost:8081 funcionará.
Acessos diretos às VMs serão BLOQUEADOS.
MSG

  # ========================================================================
  # VM1 - PROXY REVERSO (Gateway de Acesso)
  # ========================================================================
  # FUNÇÃO: Único ponto de entrada do sistema
  # CONECTIVIDADE: Host + Internet + Frontend (rede interna)
  # ISOLAMENTO: Mantém NAT permanentemente para servir como gateway
  # ========================================================================
  
  config.vm.define "proxy", primary: true do |proxy|
    proxy.vm.hostname = "proxy"
    
    # CONFIGURAÇÃO DE REDE:
    # - NAT padrão: Acesso à internet (automático)
    # - Rede interna: Comunicação com frontend (192.168.56.x)
    # - Port forward: Host:8081 → Proxy:80
    proxy.vm.network "private_network", ip: "192.168.56.10", virtualbox__intnet: "proxy_net"
    proxy.vm.network "forwarded_port", guest: 80, host: 8081

    # RECURSOS DA VM
    proxy.vm.provider "virtualbox" do |vb|
      vb.name = "vm-proxy"
      vb.memory = 512        # RAM mínima para Nginx
      vb.cpus = 1           # CPU single-core suficiente
    end

    # PROVISIONAMENTO: Instalar e configurar Nginx
    proxy.vm.provision "shell", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🔄 Atualizando pacotes e instalando Nginx..."
      apt-get update -y
      apt-get install -y nginx

      echo "⚙️ Configurando Nginx como proxy reverso..."
      # Configuração que redireciona todas as requisições para o frontend
      cat > /etc/nginx/sites-available/default <<'NGINX'
server {
    listen 80;
    
    # Proxy reverso para o frontend na rede interna
    location / {
        proxy_pass http://192.168.56.11:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

      echo "🚀 Habilitando e iniciando Nginx..."
      systemctl enable nginx
      systemctl restart nginx
      
      echo "✅ Proxy configurado e funcionando!"
    SHELL
  end

  # ========================================================================
  # VM2 - FRONTEND (Interface do Usuário)
  # ========================================================================
  # FUNÇÃO: Servidor de desenvolvimento React/Vite
  # CONECTIVIDADE INICIAL: Internet (Fase 1) + Proxy + Backend
  # CONECTIVIDADE FINAL: Apenas Proxy + Backend (NAT removida na Fase 2)
  # ISOLAMENTO: Remove acesso à internet e host após provisionamento
  # ========================================================================
  
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "frontend"
    
    # CONFIGURAÇÃO DE REDE:
    # - NAT padrão: Internet para instalação (removida na Fase 2)
    # - Rede proxy_net: Comunicação com proxy (192.168.56.x)
    # - Rede backend_net: Comunicação com backend (192.168.57.x)
    # - virtualbox__intnet: Rede interna, não acessível do host
    frontend.vm.network "private_network", ip: "192.168.56.11", virtualbox__intnet: "proxy_net"
    frontend.vm.network "private_network", ip: "192.168.57.10", virtualbox__intnet: "backend_net"

    # RECURSOS DA VM
    frontend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-frontend"
      vb.memory = 1024       # RAM para Node.js + Vite
      vb.cpus = 2           # Multi-core para compilação
    end

    # =====================================================================
    # FASE 1: INSTALAÇÃO DE DEPENDÊNCIAS (COM INTERNET)
    # =====================================================================
    # Instala Node.js, copia projeto e instala dependências npm
    # Requer NAT ativa para baixar pacotes da internet
    # =====================================================================
    
    frontend.vm.provision "shell", name: "install_dependencies", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🔄 Fase 1: Instalando dependências do Frontend..."
      
      # Instalar Node.js 22 LTS via NodeSource
      echo "📦 Instalando Node.js 22..."
      apt-get update -y
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
      apt-get install -y nodejs
      
      echo "Node.js: $(node --version)"
      echo "npm: $(npm --version)"

      # Copiar projeto para diretório local (evita problemas de symlink)
      echo "📁 Copiando projeto para diretório local..."
      cp -r /vagrant/frontend /home/vagrant/frontend-local
      cd /home/vagrant/frontend-local
      chown -R vagrant:vagrant /home/vagrant/frontend-local
      
      # Limpar instalação anterior e instalar dependências
      echo "📦 Instalando dependências npm..."
      rm -rf node_modules package-lock.json || true
      sudo -u vagrant npm install

      # Criar serviço systemd para execução automática
      echo "⚙️ Configurando serviço systemd..."
      cat > /etc/systemd/system/frontend.service <<EOF
[Unit]
Description=Vite Frontend Dev Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/vagrant/frontend-local
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=always
User=vagrant
StandardOutput=append:/var/log/frontend.log
StandardError=append:/var/log/frontend.log

[Install]
WantedBy=multi-user.target
EOF

      systemctl daemon-reload
      systemctl enable frontend
      
      echo "✅ Fase 1 concluída: Dependencies instaladas!"
    SHELL

    # =====================================================================
    # FASE 2: PREPARAR ISOLAMENTO (CRIA SCRIPT PARA APLICAR DEPOIS)
    # =====================================================================
    # Cria script que será executado após o Vagrant terminar
    # Evita timeout do Vagrant durante remoção da NAT
    # =====================================================================
    
    frontend.vm.provision "shell", name: "prepare_isolation", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🔒 Fase 2: Preparando isolamento de rede..."
      
      # Criar script para aplicar isolamento após provisionamento
      cat > /home/vagrant/apply_network_isolation.sh <<'SCRIPT'
#!/bin/bash
set -e

echo "🌐 Aplicando isolamento de rede..."

# Configurar netplan removendo interface NAT
cat > /etc/netplan/01-network.yaml <<EOF
network:
  version: 2
  ethernets:
    enp0s8:  # Interface da rede proxy_net (192.168.56.x)
      dhcp4: no
      addresses:
        - 192.168.56.11/24
    enp0s9:  # Interface da rede backend_net (192.168.57.x)
      dhcp4: no
      addresses:
        - 192.168.57.10/24
EOF

# Aplicar nova configuração de rede
netplan apply

echo "✅ Isolamento de rede aplicado com sucesso!"
SCRIPT

      chmod +x /home/vagrant/apply_network_isolation.sh
      
      echo "✅ Fase 2 concluída: Script de isolamento preparado!"
    SHELL

    # =====================================================================
    # FASE 3: FINALIZAÇÃO (INICIA SERVIÇOS COM REDE AINDA ATIVA)
    # =====================================================================
    # Inicia serviços enquanto Vagrant ainda tem conectividade
    # =====================================================================
    
    frontend.vm.provision "shell", name: "start_services", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🚀 Fase 3: Iniciando serviços do Frontend..."
      
      # Iniciar serviço frontend
      systemctl start frontend
      
      echo "✅ Frontend configurado e funcionando!"
      echo "   - Serviço ativo: ✅"
      echo "   - Para aplicar isolamento: vagrant ssh frontend -c 'sudo /home/vagrant/apply_network_isolation.sh'"
    SHELL

  end

  # ========================================================================
  # VM3 - BACKEND (API e Banco de Dados)
  # ========================================================================
  # FUNÇÃO: Servidor de API Fastify + Banco SQLite
  # CONECTIVIDADE INICIAL: Internet (Fase 1) + Frontend
  # CONECTIVIDADE FINAL: Apenas Frontend (NAT removida na Fase 2)
  # ISOLAMENTO: Máximo isolamento - sem acesso à internet, host ou proxy
  # ========================================================================
  
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "backend"
    
    # CONFIGURAÇÃO DE REDE:
    # - NAT padrão: Internet para instalação (removida na Fase 2)
    # - Rede backend_net: Comunicação APENAS com frontend (192.168.57.x)
    # - virtualbox__intnet: Rede interna, completamente isolada do host
    backend.vm.network "private_network", ip: "192.168.57.11", virtualbox__intnet: "backend_net"

    # RECURSOS DA VM
    backend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-backend"
      vb.memory = 1024       # RAM para Node.js + SQLite
      vb.cpus = 2           # Multi-core para API
    end

    # =====================================================================
    # FASE 1: INSTALAÇÃO DE DEPENDÊNCIAS E BANCO (COM INTERNET)
    # =====================================================================
    # Instala Node.js, copia projeto, instala dependências e configura DB
    # Requer NAT ativa para baixar pacotes da internet
    # =====================================================================
    
    backend.vm.provision "shell", name: "install_dependencies", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🔄 Fase 1: Instalando dependências do Backend..."
      
      # Instalar Node.js 22 LTS via NodeSource
      echo "📦 Instalando Node.js 22..."
      apt-get update -y
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
      apt-get install -y nodejs
      
      echo "Node.js: $(node --version)"
      echo "npm: $(npm --version)"

      # Copiar projeto para diretório local (evita problemas de symlink)
      echo "📁 Copiando projeto para diretório local..."
      cp -r /vagrant/backend /home/vagrant/backend-local
      cd /home/vagrant/backend-local
      chown -R vagrant:vagrant /home/vagrant/backend-local
      
      # Instalar dependências npm
      echo "📦 Instalando dependências npm..."
      sudo -u vagrant npm install
      
      # Configurar banco de dados
      echo "🗄️ Configurando banco de dados..."
      sudo -u vagrant npm run migrate    # Criar tabelas
      sudo -u vagrant npm run seed       # Inserir dados iniciais

      # Criar serviço systemd para execução automática
      echo "⚙️ Configurando serviço systemd..."
      cat > /etc/systemd/system/backend.service <<EOF
[Unit]
Description=Fastify Backend Dev Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/vagrant/backend-local
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev
Restart=always
User=vagrant
StandardOutput=append:/var/log/backend.log
StandardError=append:/var/log/backend.log

[Install]
WantedBy=multi-user.target
EOF

      systemctl daemon-reload
      systemctl enable backend
      
      echo "✅ Fase 1 concluída: Backend e banco configurados!"
    SHELL

    # =====================================================================
    # FASE 2: PREPARAR ISOLAMENTO MÁXIMO (CRIA SCRIPT PARA APLICAR DEPOIS)
    # =====================================================================
    # Cria script que será executado após o Vagrant terminar
    # Evita timeout do Vagrant durante remoção da NAT
    # =====================================================================
    
    backend.vm.provision "shell", name: "prepare_isolation", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🔒 Fase 2: Preparando isolamento máximo..."
      
      # Criar script para aplicar isolamento após provisionamento
      cat > /home/vagrant/apply_network_isolation.sh <<'SCRIPT'
#!/bin/bash
set -e

echo "🌐 Aplicando isolamento máximo..."

# Configurar netplan removendo interface NAT
cat > /etc/netplan/01-network.yaml <<EOF
network:
  version: 2
  ethernets:
    enp0s8:  # Interface da rede backend_net (192.168.57.x)
      dhcp4: no
      addresses:
        - 192.168.57.11/24
EOF

# Aplicar nova configuração de rede
netplan apply

echo "✅ Isolamento máximo aplicado com sucesso!"
SCRIPT

      chmod +x /home/vagrant/apply_network_isolation.sh
      
      echo "✅ Fase 2 concluída: Script de isolamento preparado!"
    SHELL

    # =====================================================================
    # FASE 3: FINALIZAÇÃO (INICIA SERVIÇOS COM REDE AINDA ATIVA)
    # =====================================================================
    # Inicia serviços enquanto Vagrant ainda tem conectividade
    # =====================================================================
    
    backend.vm.provision "shell", name: "start_services", inline: <<-SHELL
      set -e  # Parar execução em caso de erro
      
      echo "🚀 Fase 3: Iniciando serviços do Backend..."
      
      # Iniciar serviço backend
      systemctl start backend
      
      echo "✅ Backend configurado e funcionando!"
      echo "   - Serviço ativo: ✅"
      echo "   - Para aplicar isolamento: vagrant ssh backend -c 'sudo /home/vagrant/apply_network_isolation.sh'"
    SHELL
    
  end
end