Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  # Evita reconexões e acelera boot SSH
  config.ssh.insert_key = false
  # Aumenta tolerância de boot com operações pesadas
  config.vm.boot_timeout = 600

  # Mensagens de feedback no ciclo de vida (principalmente para frontend)
  config.trigger.before :up do |t|
    t.only_on = ["frontend"]
    t.info = "[frontend] Iniciando VM... isso pode levar alguns minutos."
  end

  config.trigger.after :up do |t|
    t.only_on = ["frontend"]
    t.info = "[frontend] VM pronta. Iniciando provisionamento/serviços."
  end

  config.trigger.after :provision do |t|
    t.only_on = ["frontend"]
    t.info = "[frontend] Provisionamento concluído. Verifique os logs: /var/log/frontend.log"
  end

  # Mensagem final com endpoints úteis
  config.vm.post_up_message = <<-MSG
Projeto no ar:
  Proxy:        http://localhost:8081
  Frontend:     http://192.168.56.11:5173
  Backend API:  http://192.168.57.11:3333
MSG

  # ---------- VM1 - Proxy ----------
  config.vm.define "proxy" do |proxy|
    proxy.vm.hostname = "proxy"

    # NAT padrão (internet)
    # Rede interna com frontend
    proxy.vm.network "private_network", ip: "192.168.56.10"

    # Forward da porta 80 do proxy para o host 8081
    proxy.vm.network "forwarded_port", guest: 80, host: 8081

    proxy.vm.provider "virtualbox" do |vb|
      vb.name = "vm-proxy"
      vb.memory = 512
      vb.cpus = 1
    end

    proxy.vm.provision "shell", inline: <<-SHELL
      set -e
      apt-get update -y
      apt-get install -y nginx

      # Detectar interface da rede 192.168.56.0/24 e configurar Netplan
      IFACE=$(ip -o -4 addr list | awk '/192.168.56\./ {print $2; exit}')
      if [ -n "$IFACE" ]; then
        cat > /etc/netplan/01-config.yaml <<NETPLAN
network:
  version: 2
  ethernets:
    ${IFACE}:
      dhcp4: no
      addresses:
        - 192.168.56.10/24
NETPLAN
        netplan apply
      fi

      # Configurar Nginx para redirecionar para o frontend
      cat > /etc/nginx/sites-available/default <<'NGINX'
server {
    listen 80;

    location / {
        proxy_pass http://192.168.56.11:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

      # Validar configuração
      nginx -t

      # Habilitar e iniciar de forma idempotente
      systemctl daemon-reload || true
      systemctl enable nginx || true
      if systemctl is-active --quiet nginx; then
        systemctl restart nginx
      else
        systemctl start nginx
      fi
    SHELL
  end

  # ---------- VM2 - Frontend ----------
  config.vm.define "frontend" do |frontend|
    frontend.vm.hostname = "frontend"

    # Rede com proxy
    frontend.vm.network "private_network", ip: "192.168.56.11"
    # Rede com backend
    frontend.vm.network "private_network", ip: "192.168.57.10"

    frontend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-frontend"
      vb.memory = 1024
      vb.cpus = 2
    end

    frontend.vm.provision "shell", inline: <<-SHELL
      set -e
      # Instalar Node.js 22
      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
      sudo apt-get install -y nodejs

      echo "Node.js version: $(node --version)"
      echo "npm version: $(npm --version)"

      # Configurar Netplan preservando NAT (SSH) e redes privadas
      NAT_IFACE=$(ip route | awk '/^default/ {print $5; exit}')
      IFACE56=$(ip -o -4 addr list | awk '/192.168.56\./ {print $2; exit}')
      IFACE57=$(ip -o -4 addr list | awk '/192.168.57\./ {print $2; exit}')
      if [ -n "$NAT_IFACE" ]; then
        # Fase 1: com internet (NAT ativo) para instalar dependências
        cat > /etc/netplan/01-config.yaml <<NETPLAN
network:
  version: 2
  ethernets:
    ${NAT_IFACE}:
      dhcp4: true
NETPLAN
        if [ -n "$IFACE56" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE56}:
      dhcp4: no
      addresses:
        - 192.168.56.11/24
NETPLAN
        fi
        if [ -n "$IFACE57" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE57}:
      dhcp4: no
      addresses:
        - 192.168.57.10/24
NETPLAN
        fi
        netplan apply
      fi

      # Instalar dependências (copiar para diretório local para evitar problemas de symlink)
      cp -r /vagrant/frontend /home/vagrant/frontend-local
      cd /home/vagrant/frontend-local
      # Corrigir permissões e reinstalar como usuário vagrant
      chown -R vagrant:vagrant /home/vagrant/frontend-local
      rm -rf node_modules package-lock.json || true
      sudo -u vagrant npm ci || sudo -u vagrant npm install

      # Criar serviço systemd para o frontend
      sudo bash -c 'cat > /etc/systemd/system/frontend.service <<EOF
[Unit]
Description=Vite Frontend Dev Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/home/vagrant/frontend-local
Environment=PATH=/usr/local/bin:/usr/bin
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=always
RestartSec=2
User=vagrant
StandardOutput=append:/var/log/frontend.log
StandardError=append:/var/log/frontend.log

[Install]
WantedBy=multi-user.target
EOF'

      sudo systemctl daemon-reload
      sudo systemctl enable frontend
      sudo systemctl restart frontend || sudo systemctl start frontend

      # Fase 2: desativar rota/DNS da NAT para manter arquitetura (sem perder SSH)
      NAT_IFACE=$(ip route | awk '/^default/ {print $5; exit}')
      IFACE56=$(ip -o -4 addr list | awk '/192.168.56\./ {print $2; exit}')
      IFACE57=$(ip -o -4 addr list | awk '/192.168.57\./ {print $2; exit}')
      if [ -n "$NAT_IFACE" ]; then
        cat > /etc/netplan/01-config.yaml <<NETPLAN
network:
  version: 2
  ethernets:
    ${NAT_IFACE}:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
        use-dns: false
      optional: true
NETPLAN
        if [ -n "$IFACE56" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE56}:
      dhcp4: no
      addresses:
        - 192.168.56.11/24
NETPLAN
        fi
        if [ -n "$IFACE57" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE57}:
      dhcp4: no
      addresses:
        - 192.168.57.10/24
NETPLAN
        fi
        netplan apply || true
      fi
    SHELL
  end

  # ---------- VM3 - Backend ----------
  config.vm.define "backend" do |backend|
    backend.vm.hostname = "backend"

    # Rede interna apenas com frontend
    backend.vm.network "private_network", ip: "192.168.57.11"

    backend.vm.provider "virtualbox" do |vb|
      vb.name = "vm-backend"
      vb.memory = 1024
      vb.cpus = 2
    end

    backend.vm.provision "shell", inline: <<-SHELL
      set -e
      # Instalar Node.js 22
      apt-get update -y
      apt-get install -y ca-certificates curl gnupg
      mkdir -p /etc/apt/keyrings
      curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
      echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
      apt-get update -y
      apt-get install -y nodejs

      echo "Node.js version: $(node --version)"
      echo "npm version: $(npm --version)"

      # Configurar Netplan preservando NAT (SSH) e rede privada
      NAT_IFACE=$(ip route | awk '/^default/ {print $5; exit}')
      IFACE=$(ip -o -4 addr list | awk '/192.168.57\./ {print $2; exit}')
      if [ -n "$NAT_IFACE" ]; then
        # Fase 1: com internet (NAT ativo) para instalar dependências
        cat > /etc/netplan/01-config.yaml <<NETPLAN
network:
  version: 2
  ethernets:
    ${NAT_IFACE}:
      dhcp4: true
NETPLAN
        if [ -n "$IFACE" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE}:
      dhcp4: no
      addresses:
        - 192.168.57.11/24
NETPLAN
        fi
        netplan apply
      fi

      # Instalar dependências e preparar banco (copiar para diretório local para evitar problemas de symlink)
      cp -r /vagrant/backend /home/vagrant/backend-local
      cd /home/vagrant/backend-local
      npm install --no-optional
      npm run migrate
      npm run seed

      # Criar serviço systemd para o backend
      sudo bash -c 'cat > /etc/systemd/system/backend.service <<EOF
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
EOF'

      sudo systemctl daemon-reload
      sudo systemctl enable backend
      sudo systemctl restart backend || sudo systemctl start backend

      # Fase 2: desativar rota/DNS da NAT para manter arquitetura (sem perder SSH)
      NAT_IFACE=$(ip route | awk '/^default/ {print $5; exit}')
      IFACE=$(ip -o -4 addr list | awk '/192.168.57\./ {print $2; exit}')
      if [ -n "$NAT_IFACE" ]; then
        cat > /etc/netplan/01-config.yaml <<NETPLAN
network:
  version: 2
  ethernets:
    ${NAT_IFACE}:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
        use-dns: false
      optional: true
NETPLAN
        if [ -n "$IFACE" ]; then
          cat >> /etc/netplan/01-config.yaml <<NETPLAN
    ${IFACE}:
      dhcp4: no
      addresses:
        - 192.168.57.11/24
NETPLAN
        fi
        netplan apply || true
      fi
    SHELL
  end
end