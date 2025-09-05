# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Configuração global
  config.vm.box = "ubuntu/jammy64"
  
  # Configuração da rede interna
  config.vm.network "private_network", type: "dhcp"
  
  # ===== VM1: PROXY (Nginx) =====
  config.vm.define "proxy" do |proxy|
    proxy.vm.hostname = "proxy"
    proxy.vm.network "forwarded_port", guest: 80, host: 8080
    proxy.vm.network "forwarded_port", guest: 443, host: 8443
    
    proxy.vm.provider "virtualbox" do |vb|
      vb.name = "cloud-proxy"
      vb.memory = "512"
      vb.cpus = 1
    end
    
    proxy.vm.provision "shell", inline: <<-SHELL
      # Atualizar sistema
      apt-get update
      apt-get upgrade -y
      
      # Instalar Nginx
      apt-get install -y nginx
      
      # Configurar Nginx como proxy reverso
      cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Proxy para frontend
    location / {
        proxy_pass http://192.168.56.11:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support para Vite HMR
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Proxy para API backend
    location /api/ {
        proxy_pass http://192.168.56.12:3333/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
      
      # Reiniciar Nginx
      systemctl enable nginx
      systemctl restart nginx
      
      echo "Proxy VM configurado com sucesso!"
    SHELL
  end
  
  # ===== VM2: FRONTEND (React/Vite) =====
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "frontend"
    frontend.vm.network "private_network", ip: "192.168.56.11"
    
    frontend.vm.provider "virtualbox" do |vb|
      vb.name = "cloud-frontend"
      vb.memory = "1024"
      vb.cpus = 1
    end
    
    # Sincronizar pasta do frontend
    frontend.vm.synced_folder "./frontend", "/vagrant/frontend"
    
    frontend.vm.provision "shell", inline: <<-SHELL
      # Atualizar sistema
      apt-get update
      apt-get upgrade -y
      
      # Instalar Node.js 20.x
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      apt-get install -y nodejs
      
      # Instalar dependências do frontend
      cd /vagrant/frontend
      npm install
      
      # Configurar Vite para aceitar conexões externas
      cat > /vagrant/frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})
EOF
      
      # Criar serviço systemd para o frontend
      cat > /etc/systemd/system/frontend.service << 'EOF'
[Unit]
Description=Frontend React App
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/vagrant/frontend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOF
      
      # Habilitar e iniciar serviço
      systemctl daemon-reload
      systemctl enable frontend
      systemctl start frontend
      
      echo "Frontend VM configurado com sucesso!"
    SHELL
  end
  
  # ===== VM3: BACKEND (Node.js/Fastify) =====
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "backend"
    backend.vm.network "private_network", ip: "192.168.56.12"
    
    backend.vm.provider "virtualbox" do |vb|
      vb.name = "cloud-backend"
      vb.memory = "1024"
      vb.cpus = 1
    end
    
    # Sincronizar pasta do backend
    backend.vm.synced_folder "./backend", "/vagrant/backend"
    
    backend.vm.provision "shell", inline: <<-SHELL
      # Atualizar sistema
      apt-get update
      apt-get upgrade -y
      
      # Instalar Node.js 20.x
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      apt-get install -y nodejs
      
      # Instalar dependências do backend
      cd /vagrant/backend
      npm install
      
      # Executar migrações do banco
      npm run migrate
      
      # Configurar CORS no backend para aceitar requisições do proxy
      cat > /vagrant/backend/src/cors-config.ts << 'EOF'
export const corsConfig = {
  origin: ['http://192.168.56.10', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
EOF
      
      # Criar serviço systemd para o backend
      cat > /etc/systemd/system/backend.service << 'EOF'
[Unit]
Description=Backend Node.js API
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/vagrant/backend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOF
      
      # Habilitar e iniciar serviço
      systemctl daemon-reload
      systemctl enable backend
      systemctl start backend
      
      echo "Backend VM configurado com sucesso!"
    SHELL
  end
  
  # Script pós-provisionamento para aguardar serviços iniciarem
  config.vm.provision "shell", run: "always", inline: <<-SHELL
    echo "Aguardando serviços iniciarem..."
    sleep 30
    
    echo "Verificando status dos serviços:"
    echo "Frontend: http://192.168.56.11:5173"
    echo "Backend: http://192.168.56.12:3333"
    echo "Proxy: http://localhost:8080"
    echo ""
    echo "Para acessar a aplicação, use: http://localhost:8080"
    echo "O proxy redirecionará automaticamente para o frontend e backend"
  SHELL
end
