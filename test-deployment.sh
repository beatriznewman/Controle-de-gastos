#!/bin/bash

# Script para testar o deployment das VMs
echo "🧪 Testando deployment do ambiente Cloud..."
echo ""

# Função para testar conectividade
test_connectivity() {
    local vm_name=$1
    local target_ip=$2
    local target_port=$3
    local service_name=$4
    
    echo "🔍 Testando $service_name em $vm_name..."
    
    if vagrant ssh $vm_name -c "curl -s -o /dev/null -w '%{http_code}' http://$target_ip:$target_port" | grep -q "200\|404\|405"; then
        echo "✅ $service_name está respondendo"
        return 0
    else
        echo "❌ $service_name não está respondendo"
        return 1
    fi
}

# Verificar se as VMs estão rodando
echo "📋 Verificando status das VMs..."
vagrant status

echo ""
echo "🔍 Testando conectividade entre as VMs..."

# Testar backend
test_connectivity "backend" "192.168.56.12" "3333" "Backend API"

# Testar frontend
test_connectivity "frontend" "192.168.56.11" "5173" "Frontend React"

# Testar proxy
test_connectivity "proxy" "192.168.56.10" "80" "Proxy Nginx"

echo ""
echo "🌐 Testando acesso externo..."

# Testar acesso via proxy
if curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 | grep -q "200\|404\|405"; then
    echo "✅ Aplicação acessível via http://localhost:8080"
else
    echo "❌ Aplicação não acessível via http://localhost:8080"
fi

echo ""
echo "📊 Resumo dos testes:"
echo "   - Backend: http://192.168.56.12:3333"
echo "   - Frontend: http://192.168.56.11:5173"
echo "   - Proxy: http://192.168.56.10:80"
echo "   - Aplicação: http://localhost:8080"
echo ""
echo "🎯 Para acessar a aplicação completa, use: http://localhost:8080"
