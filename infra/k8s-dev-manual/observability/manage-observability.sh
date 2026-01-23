#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="monitoring"
LOKI_RELEASE="loki"
KPSTACK_RELEASE="kpstack"
ALLOY_RELEASE="galloy"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

pause() {
    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read -r
}

check_namespace() {
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_helm_release() {
    local release=$1
    if helm list -n "$NAMESPACE" | grep -q "^$release"; then
        return 0
    else
        return 1
    fi
}

# Menu functions
create_namespace() {
    print_header "Creating Monitoring Namespace"
    
    if check_namespace; then
        print_warning "Namespace '$NAMESPACE' already exists"
    else
        if kubectl create namespace "$NAMESPACE"; then
            print_success "Namespace '$NAMESPACE' created successfully"
        else
            print_error "Failed to create namespace"
        fi
    fi
    
    pause
}

add_helm_repos() {
    print_header "Adding Helm Repositories"
    
    print_info "Adding Grafana helm repo..."
    if helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true; then
        print_success "Grafana repo added/already exists"
    fi
    
    print_info "Adding Prometheus Community helm repo..."
    if helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true; then
        print_success "Prometheus Community repo added/already exists"
    fi
    
    print_info "Updating helm repos..."
    if helm repo update; then
        print_success "Helm repos updated successfully"
    else
        print_error "Failed to update helm repos"
    fi
    
    pause
}

deploy_loki() {
    print_header "Deploying Loki"
    
    if ! check_namespace; then
        print_error "Namespace '$NAMESPACE' does not exist. Create it first."
        pause
        return
    fi
    
    if check_helm_release "$LOKI_RELEASE"; then
        print_warning "Loki is already deployed"
        echo -n "Do you want to upgrade it? (y/n): "
        read -r upgrade
        if [[ $upgrade == "y" ]]; then
            print_info "Upgrading Loki..."
            if helm upgrade "$LOKI_RELEASE" grafana/loki --namespace "$NAMESPACE" --version 6.37.0 --values "$SCRIPT_DIR/2-loki/values.yaml"; then
                print_success "Loki upgraded successfully"
            else
                print_error "Failed to upgrade Loki"
            fi
        fi
    else
        print_info "Installing Loki..."
        if helm install "$LOKI_RELEASE" grafana/loki --namespace "$NAMESPACE" --version 6.37.0 --values "$SCRIPT_DIR/2-loki/values.yaml"; then
            print_success "Loki deployed successfully"
        else
            print_error "Failed to deploy Loki"
        fi
    fi
    
    pause
}

deploy_kube_prometheus_stack() {
    print_header "Deploying Kube-Prometheus-Stack (Prometheus + Grafana)"
    
    if ! check_namespace; then
        print_error "Namespace '$NAMESPACE' does not exist. Create it first."
        pause
        return
    fi
    
    if check_helm_release "$KPSTACK_RELEASE"; then
        print_warning "Kube-Prometheus-Stack is already deployed"
        echo -n "Do you want to upgrade it? (y/n): "
        read -r upgrade
        if [[ $upgrade == "y" ]]; then
            print_info "Upgrading Kube-Prometheus-Stack..."
            if helm upgrade "$KPSTACK_RELEASE" prometheus-community/kube-prometheus-stack --namespace "$NAMESPACE" --version 77.0.2 --values "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/values.yaml"; then
                print_success "Kube-Prometheus-Stack upgraded successfully"
            else
                print_error "Failed to upgrade Kube-Prometheus-Stack"
            fi
        fi
    else
        print_info "Installing Kube-Prometheus-Stack..."
        if helm install "$KPSTACK_RELEASE" prometheus-community/kube-prometheus-stack --namespace "$NAMESPACE" --version 77.0.2 --values "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/values.yaml"; then
            print_success "Kube-Prometheus-Stack deployed successfully"
            print_info "Getting Grafana credentials..."
            echo ""
            bash "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/getGrafanaCredentials.sh" 2>/dev/null || {
                print_info "Username: admin"
                print_info "Password: Run 'kubectl get secret -n monitoring kpstack-grafana -o jsonpath=\"{.data.admin-password}\" | base64 --decode'"
            }
        else
            print_error "Failed to deploy Kube-Prometheus-Stack"
        fi
    fi
    
    pause
}

deploy_service_monitors() {
    print_header "Deploying Service Monitors"
    
    if ! check_namespace; then
        print_error "Namespace '$NAMESPACE' does not exist. Create it first."
        pause
        return
    fi
    
    print_info "Applying ServiceMonitor configuration..."
    if kubectl apply -f "$SCRIPT_DIR/5-scraping metrics/scrap.serviceMonitor.yaml"; then
        print_success "ServiceMonitors deployed successfully"
        print_info "Make sure your services have:"
        echo "  - /metrics endpoint"
        echo "  - label 'monitor: true'"
        echo "  - port name matching 'web' in serviceMonitor"
    else
        print_error "Failed to deploy ServiceMonitors"
    fi
    
    pause
}

deploy_grafana_alloy() {
    print_header "Deploying Grafana Alloy (Log Scraping)"
    
    if ! check_namespace; then
        print_error "Namespace '$NAMESPACE' does not exist. Create it first."
        pause
        return
    fi
    
    if check_helm_release "$ALLOY_RELEASE"; then
        print_warning "Grafana Alloy is already deployed"
        echo -n "Do you want to upgrade it? (y/n): "
        read -r upgrade
        if [[ $upgrade == "y" ]]; then
            print_info "Upgrading Grafana Alloy..."
            if helm upgrade "$ALLOY_RELEASE" grafana/alloy --namespace "$NAMESPACE" --values "$SCRIPT_DIR/6-grafana-alloy/values.yaml"; then
                print_success "Grafana Alloy upgraded successfully"
            else
                print_error "Failed to upgrade Grafana Alloy"
            fi
        fi
    else
        print_info "Installing Grafana Alloy..."
        if helm install "$ALLOY_RELEASE" grafana/alloy --namespace "$NAMESPACE" --values "$SCRIPT_DIR/6-grafana-alloy/values.yaml"; then
            print_success "Grafana Alloy deployed successfully"
        else
            print_error "Failed to deploy Grafana Alloy"
        fi
    fi
    
    pause
}

deploy_all() {
    print_header "Deploying Complete Observability Stack"
    
    print_info "This will deploy the entire observability stack in order..."
    echo -n "Continue? (y/n): "
    read -r confirm
    
    if [[ $confirm != "y" ]]; then
        return
    fi
    
    # Step by step deployment
    if ! check_namespace; then
        print_info "Creating namespace..."
        kubectl create namespace "$NAMESPACE"
    fi
    
    print_info "Adding helm repos..."
    helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
    helm repo update
    
    print_info "Deploying Loki..."
    if ! check_helm_release "$LOKI_RELEASE"; then
        helm install "$LOKI_RELEASE" grafana/loki --namespace "$NAMESPACE" --version 6.37.0 --values "$SCRIPT_DIR/2-loki/values.yaml"
    fi
    
    print_info "Deploying Kube-Prometheus-Stack..."
    if ! check_helm_release "$KPSTACK_RELEASE"; then
        helm install "$KPSTACK_RELEASE" prometheus-community/kube-prometheus-stack --namespace "$NAMESPACE" --version 77.0.2 --values "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/values.yaml"
    fi
    
    print_info "Deploying ServiceMonitors..."
    kubectl apply -f "$SCRIPT_DIR/5-scraping metrics/scrap.serviceMonitor.yaml"
    
    print_info "Deploying Grafana Alloy..."
    if ! check_helm_release "$ALLOY_RELEASE"; then
        helm install "$ALLOY_RELEASE" grafana/alloy --namespace "$NAMESPACE" --values "$SCRIPT_DIR/6-grafana-alloy/values.yaml"
    fi
    
    print_success "Complete observability stack deployed!"
    
    pause
}

check_status() {
    print_header "Observability Stack Status"
    
    print_info "Namespace Status:"
    if check_namespace; then
        print_success "Namespace '$NAMESPACE' exists"
    else
        print_error "Namespace '$NAMESPACE' does not exist"
    fi
    
    echo ""
    print_info "Helm Releases:"
    helm list -n "$NAMESPACE" 2>/dev/null || print_warning "No releases found or namespace doesn't exist"
    
    echo ""
    print_info "Pods Status:"
    kubectl get pods -n "$NAMESPACE" 2>/dev/null || print_warning "Cannot get pods"
    
    echo ""
    print_info "Services:"
    kubectl get svc -n "$NAMESPACE" 2>/dev/null || print_warning "Cannot get services"
    
    pause
}

port_forward_grafana() {
    print_header "Port Forward Grafana"
    
    print_info "Starting port-forward to Grafana on localhost:3000..."
    print_warning "Press Ctrl+C to stop port-forwarding"
    echo ""
    
    if [ -f "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/pf-grafana.sh" ]; then
        bash "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/pf-grafana.sh"
    else
        kubectl port-forward -n "$NAMESPACE" svc/"$KPSTACK_RELEASE"-grafana 3000:80
    fi
    
    pause
}

port_forward_prometheus() {
    print_header "Port Forward Prometheus"
    
    print_info "Starting port-forward to Prometheus on localhost:9090..."
    print_warning "Press Ctrl+C to stop port-forwarding"
    echo ""
    
    if [ -f "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/pf-prometheus.sh" ]; then
        bash "$SCRIPT_DIR/4-kube-prometheus-stack(grafana + prometheus)/pf-prometheus.sh"
    else
        kubectl port-forward -n "$NAMESPACE" svc/"$KPSTACK_RELEASE"-kube-prometheus-prometheus 9090:9090
    fi
    
    pause
}

get_grafana_credentials() {
    print_header "Grafana Credentials"
    
    echo -e "${BLUE}Username:${NC} admin"
    echo -n -e "${BLUE}Password:${NC} "
    kubectl get secret -n "$NAMESPACE" "$KPSTACK_RELEASE"-grafana -o jsonpath="{.data.admin-password}" 2>/dev/null | base64 --decode
    echo -e "\n"
    
    pause
}

view_logs() {
    print_header "View Component Logs"
    
    echo "1. Loki logs"
    echo "2. Prometheus logs"
    echo "3. Grafana logs"
    echo "4. Grafana Alloy logs"
    echo "5. Back"
    echo ""
    echo -n "Select component: "
    read -r component
    
    case $component in
        1)
            print_info "Showing Loki logs..."
            kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=loki --tail=100 -f
            ;;
        2)
            print_info "Showing Prometheus logs..."
            kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=prometheus --tail=100 -f
            ;;
        3)
            print_info "Showing Grafana logs..."
            kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=grafana --tail=100 -f
            ;;
        4)
            print_info "Showing Grafana Alloy logs..."
            kubectl logs -n "$NAMESPACE" -l app.kubernetes.io/name=alloy --tail=100 -f
            ;;
        5)
            return
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    pause
}

debug_alloy_config() {
    print_header "Debug Grafana Alloy Configuration"
    
    print_info "Finding Grafana Alloy pod..."
    ALLOY_POD=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=alloy -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$ALLOY_POD" ]; then
        print_error "Grafana Alloy pod not found"
    else
        print_success "Found pod: $ALLOY_POD"
        print_info "Alloy configuration:"
        echo ""
        kubectl exec -n "$NAMESPACE" -it "$ALLOY_POD" -- cat /etc/alloy/config.alloy
    fi
    
    pause
}

uninstall_component() {
    print_header "Uninstall Component"
    
    echo "1. Uninstall Loki"
    echo "2. Uninstall Kube-Prometheus-Stack (Prometheus + Grafana)"
    echo "3. Uninstall Grafana Alloy"
    echo "4. Delete ServiceMonitors"
    echo "5. Uninstall Everything (including namespace)"
    echo "6. Back"
    echo ""
    echo -n "Select option: "
    read -r option
    
    case $option in
        1)
            print_warning "Uninstalling Loki..."
            echo -n "Are you sure? (y/n): "
            read -r confirm
            if [[ $confirm == "y" ]]; then
                helm uninstall "$LOKI_RELEASE" -n "$NAMESPACE" && print_success "Loki uninstalled"
            fi
            ;;
        2)
            print_warning "Uninstalling Kube-Prometheus-Stack..."
            echo -n "Are you sure? (y/n): "
            read -r confirm
            if [[ $confirm == "y" ]]; then
                helm uninstall "$KPSTACK_RELEASE" -n "$NAMESPACE" && print_success "Kube-Prometheus-Stack uninstalled"
            fi
            ;;
        3)
            print_warning "Uninstalling Grafana Alloy..."
            echo -n "Are you sure? (y/n): "
            read -r confirm
            if [[ $confirm == "y" ]]; then
                helm uninstall "$ALLOY_RELEASE" -n "$NAMESPACE" && print_success "Grafana Alloy uninstalled"
            fi
            ;;
        4)
            print_warning "Deleting ServiceMonitors..."
            echo -n "Are you sure? (y/n): "
            read -r confirm
            if [[ $confirm == "y" ]]; then
                kubectl delete -f "$SCRIPT_DIR/5-scraping metrics/scrap.serviceMonitor.yaml" && print_success "ServiceMonitors deleted"
            fi
            ;;
        5)
            print_error "WARNING: This will delete EVERYTHING in the monitoring namespace!"
            echo -n "Type 'DELETE' to confirm: "
            read -r confirm
            if [[ $confirm == "DELETE" ]]; then
                print_info "Uninstalling all helm releases..."
                helm uninstall "$LOKI_RELEASE" -n "$NAMESPACE" 2>/dev/null || true
                helm uninstall "$KPSTACK_RELEASE" -n "$NAMESPACE" 2>/dev/null || true
                helm uninstall "$ALLOY_RELEASE" -n "$NAMESPACE" 2>/dev/null || true
                print_info "Deleting namespace..."
                kubectl delete namespace "$NAMESPACE"
                print_success "Everything uninstalled"
            else
                print_info "Cancelled"
            fi
            ;;
        6)
            return
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    pause
}

import_dashboards() {
    print_header "Import Grafana Dashboards"
    
    print_info "Available dashboards in 5-scraping metrics/:"
    ls "$SCRIPT_DIR/5-scraping metrics/"*.json 2>/dev/null | while read -r dashboard; do
        echo "  - $(basename "$dashboard")"
    done
    
    echo ""
    print_info "To import dashboards:"
    echo "1. Access Grafana UI (use port-forward option)"
    echo "2. Go to Dashboards > Import"
    echo "3. Upload the JSON files from: $SCRIPT_DIR/5-scraping metrics/"
    
    pause
}

show_menu() {
    clear
    print_header "Observability Stack Management"
    
    echo "DEPLOYMENT:"
    echo "  1. Create Monitoring Namespace"
    echo "  2. Add Helm Repositories"
    echo "  3. Deploy Loki"
    echo "  4. Deploy Kube-Prometheus-Stack (Prometheus + Grafana)"
    echo "  5. Deploy ServiceMonitors (Metrics Scraping)"
    echo "  6. Deploy Grafana Alloy (Log Scraping)"
    echo "  7. Deploy Complete Stack (All Above)"
    echo ""
    echo "MANAGEMENT:"
    echo "  8. Check Status"
    echo "  9. View Component Logs"
    echo " 10. Port-Forward Grafana (localhost:3000)"
    echo " 11. Port-Forward Prometheus (localhost:9090)"
    echo " 12. Get Grafana Credentials"
    echo " 13. Debug Grafana Alloy Config"
    echo " 14. Import Grafana Dashboards (Info)"
    echo ""
    echo "CLEANUP:"
    echo " 15. Uninstall Component(s)"
    echo ""
    echo "  0. Exit"
    echo ""
    echo -n "Select option: "
}

# Main loop
main() {
    while true; do
        show_menu
        read -r option
        
        case $option in
            1) create_namespace ;;
            2) add_helm_repos ;;
            3) deploy_loki ;;
            4) deploy_kube_prometheus_stack ;;
            5) deploy_service_monitors ;;
            6) deploy_grafana_alloy ;;
            7) deploy_all ;;
            8) check_status ;;
            9) view_logs ;;
            10) port_forward_grafana ;;
            11) port_forward_prometheus ;;
            12) get_grafana_credentials ;;
            13) debug_alloy_config ;;
            14) import_dashboards ;;
            15) uninstall_component ;;
            0)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                pause
                ;;
        esac
    done
}

# Run the script
main
