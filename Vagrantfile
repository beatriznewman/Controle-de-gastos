Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"

  # ---------- VM1 - Proxy ----------
  config.vm.define "proxy" do |proxy|
    proxy.vm.hostname = "proxy"

    # NAT padrão (internet)
    # Rede interna com frontend
    proxy.vm.network "private_network", ip: "192.168.56.10", virtualbox__intnet: "proxy_net"

    # Forward da porta 80 do proxy para o host 8081
    proxy.vm.network "forwarded_port", guest: 80, host: 8081

    proxy.vm.provider "virtualbox" do |vb|
      vb.name = "vm-proxy"
      vb.memory = 512
      vb.cpus = 1
    end

    proxy.vm.provision "shell", inline: <<-SHELL
      apt-get update -y
      apt-get install -y nginx
      systemctl enable nginx

      # Configurar Nginx para redirecionar para o frontend
      cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;

    location / {
        proxy_pass http://192.168.56.11:5173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

      systemctl restart nginx
    SHELL
  end

  # ---------- VM2 - Frontend ----------
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "frontend"

    # Rede com proxy
    frontend.vm.network "private_network", ip: "192.168.56.11", virtualbox__intnet: "proxy_net"
    # Rede com backend
    frontend.vm.network "private_network", ip: "192.168.57.10", virtualbox__intnet: "frontend_net"

    frontend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-frontend"
      vb.memory = 1024
      vb.cpus = 2
    end

    frontend.vm.provision "shell", inline: <<-SHELL
      # Instalar Node.js 22 (método mais confiável)
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
      sudo apt-get install -y nodejs


      # Verificar versão do Node.js
      echo "Node.js version: $(node --version)"
      echo "npm version: $(npm --version)"

      # Instalar e rodar frontend
      cd /vagrant/frontend
      npm install
      npm run dev
    SHELL
  end

  # ---------- VM3 - Backend ----------
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "backend"

    # Rede interna apenas com frontend
    backend.vm.network "private_network", ip: "192.168.57.11", virtualbox__intnet: "frontend_net"

    backend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-backend"
      vb.memory = 1024
      vb.cpus = 2
    end

    backend.vm.provision "shell", inline: <<-SHELL
      # Instalar Node.js 22 (método mais confiável)
      apt-get update -y
      apt-get install -y ca-certificates curl gnupg
      mkdir -p /etc/apt/keyrings
      curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
      echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
      apt-get update -y
      apt-get install -y nodejs

      # Verificar versão do Node.js
      echo "Node.js version: $(node --version)"
      echo "npm version: $(npm --version)"

      # Instalar e rodar backend
      cd /vagrant/backend
      npm install
      npm run migrate
      npm run seed
      npm run dev
    SHELL
  end
end