#!/bin/bash

# Script para inicializar o ambiente de desenvolvimento com Vagrant
# Este script configura e inicia as 3 VMs: proxy, frontend e backend

echo "🚀 Iniciando ambiente de desenvolvimento Cloud..."
echo ""

# Verificar se o Vagrant está instalado
if ! command -v vagrant &> /dev/null; then
    echo "❌ Vagrant não está instalado. Por favor, instale o Vagrant primeiro."
    echo "   Visite: https://www.vagrantup.com/downloads"
    exit 1
fi

# Verificar se o VirtualBox está instalado
if ! command -v VBoxManage &> /dev/null; then
    echo "❌ VirtualBox não está instalado. Por favor, instale o VirtualBox primeiro."
    echo "   Visite: https://www.virtualbox.org/wiki/Downloads"
    exit 1
fi

echo "✅ Vagrant e VirtualBox encontrados"
echo ""

# Parar VMs existentes se estiverem rodando
echo "🛑 Parando VMs existentes (se houver)..."
vagrant destroy -f 2>/dev/null || true

# Iniciar as VMs
echo "📦 Iniciando VMs..."
echo "   - VM1: Proxy (Nginx) - Porta 8080"
echo "   - VM2: Frontend (React) - IP: 192.168.56.11"
echo "   - VM3: Backend (Node.js) - IP: 192.168.56.12"
echo ""

vagrant up

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Ambiente configurado com sucesso!"
    echo ""
    echo "📋 Informações de acesso:"
    echo "   🌐 Aplicação: http://localhost:8080"
    echo "   🔧 Frontend direto: http://192.168.56.11:5173"
    echo "   🔧 Backend direto: http://192.168.56.12:3333"
    echo ""
    echo "📝 Comandos úteis:"
    echo "   vagrant status          - Ver status das VMs"
    echo "   vagrant ssh proxy       - Conectar na VM do proxy"
    echo "   vagrant ssh frontend    - Conectar na VM do frontend"
    echo "   vagrant ssh backend     - Conectar na VM do backend"
    echo "   vagrant halt            - Parar todas as VMs"
    echo "   vagrant destroy         - Destruir todas as VMs"
    echo ""
    echo "🔍 Para verificar logs dos serviços:"
    echo "   vagrant ssh frontend -c 'sudo journalctl -u frontend -f'"
    echo "   vagrant ssh backend -c 'sudo journalctl -u backend -f'"
    echo "   vagrant ssh proxy -c 'sudo journalctl -u nginx -f'"
else
    echo "❌ Erro ao configurar o ambiente. Verifique os logs acima."
    exit 1
fi
