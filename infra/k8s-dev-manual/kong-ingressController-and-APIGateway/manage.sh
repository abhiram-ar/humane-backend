#!/bin/bash

set -e

NAMESPACE="kong"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELM_RELEASE_NAME="kong"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
}

check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    print_success "kubectl is installed"
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        print_error "Helm is not installed. Please install Helm first."
        print_info "Visit: https://helm.sh/docs/intro/install/"
        exit 1
    fi
    print_success "Helm is installed"
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
}

install_gateway_api_crds() {
    print_section "Installing Gateway API CRDs"
    
    print_info "Applying Gateway API CRDs v1.3.0..."
    kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
    
    print_success "Gateway API CRDs installed successfully"
}

create_gateway() {
    print_section "Creating Gateway and GatewayClass"
    
    # Create namespace if it doesn't exist
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    else
        print_info "Namespace $NAMESPACE already exists"
    fi
    
    # Apply Gateway configuration
    if [ -f "$SCRIPT_DIR/Gateway.yaml" ]; then
        print_info "Applying Gateway configuration..."
        kubectl apply -n "$NAMESPACE" -f "$SCRIPT_DIR/Gateway.yaml"
        print_success "Gateway configuration applied"
    else
        print_warning "Gateway.yaml not found in $SCRIPT_DIR"
    fi
}

install_kong() {
    print_section "Installing Kong Ingress Controller"
    
    # Add Kong Helm repository
    print_info "Adding Kong Helm repository..."
    helm repo add kong https://charts.konghq.com
    helm repo update
    
    # Install Kong
    print_info "Installing Kong Ingress Controller..."
    helm install "$HELM_RELEASE_NAME" kong/ingress -n "$NAMESPACE" --create-namespace
    
    print_success "Kong Ingress Controller installed successfully"
    
    # Wait for Kong pods to be ready
    print_info "Waiting for Kong pods to be ready..."
    sleep 5  # Give pods time to be created
    
    # Try multiple label selectors as they vary by chart version
    if kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=kong &> /dev/null; then
        kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kong -n "$NAMESPACE" --timeout=300s 2>/dev/null || true
    elif kubectl get pods -n "$NAMESPACE" -l app=kong &> /dev/null; then
        kubectl wait --for=condition=ready pod -l app=kong -n "$NAMESPACE" --timeout=300s 2>/dev/null || true
    else
        # Fallback: wait for any pod in the namespace
        kubectl wait --for=condition=ready pod --all -n "$NAMESPACE" --timeout=300s 2>/dev/null || true
    fi
    
    print_success "Kong pods are ready"
}

create_jwt_secret() {
    print_section "Creating JWT Secret Manifest"
    
    local jwt_file="$SCRIPT_DIR/jwtsecret.yaml"
    
    # Check if file already exists
    if [ -f "$jwt_file" ]; then
        print_warning "jwtsecret.yaml already exists at $jwt_file"
        read -p "Do you want to override the existing file? (yes/no): " override
        
        if [ "$override" != "yes" ]; then
            print_info "Keeping existing JWT secret file"
            return 0
        fi
    fi
    
    # Prompt for JWT secret
    print_info "Please enter the JWT secret (this will be used to sign/verify tokens):"
    read -s jwt_secret
    echo ""
    
    if [ -z "$jwt_secret" ]; then
        print_error "JWT secret cannot be empty"
        return 1
    fi
    
    # Create the manifest file
    cat > "$jwt_file" << EOF
apiVersion: v1
kind: Secret
metadata:
  name: humane-app-jwt
  namespace: default
  labels:
    konghq.com/credential: jwt
stringData:
  key: humane ## iss
  secret: $jwt_secret
  algorithm: HS256
EOF
    
    print_success "JWT secret manifest created at $jwt_file"
}

apply_jwt_config() {
    print_section "Applying JWT Configuration"
    
    # Check if JWT secret file exists
    if [ ! -f "$SCRIPT_DIR/jwtsecret.yaml" ]; then
        print_error "jwtsecret.yaml not found in $SCRIPT_DIR"
        print_info "Please create the JWT secret first by running: './manage.sh create-jwt-secret'"
        return 1
    fi
    
    # Apply JWT secret
    print_info "Applying JWT secret..."
    kubectl apply -f "$SCRIPT_DIR/jwtsecret.yaml"
    print_success "JWT secret applied"
    
    # Apply consumer JWT plugin
    if [ -f "$SCRIPT_DIR/consumer-jwt-plugin.yaml" ]; then
        print_info "Applying consumer JWT plugin..."
        kubectl apply -f "$SCRIPT_DIR/consumer-jwt-plugin.yaml"
        print_success "Consumer JWT plugin applied"
    else
        print_warning "consumer-jwt-plugin.yaml not found in $SCRIPT_DIR"
    fi
}

apply_rate_limiting() {
    print_section "Applying Rate Limiting Configuration"
    
    if [ -f "$SCRIPT_DIR/RatelimitingPlugin.yaml" ]; then
        print_info "Applying rate limiting plugin..."
        kubectl apply -f "$SCRIPT_DIR/RatelimitingPlugin.yaml"
        print_success "Rate limiting plugin applied"
    else
        print_warning "RatelimitingPlugin.yaml not found in $SCRIPT_DIR"
    fi
}

check_status() {
    print_section "Checking Kong Gateway Status"
    
    print_info "Kong Ingress Controller pods:"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=ingress
    
    echo ""
    print_info "Kong services:"
    kubectl get svc -n "$NAMESPACE"
    
    echo ""
    print_info "Gateway resources:"
    kubectl get gateway -n "$NAMESPACE"
    
    echo ""
    print_info "Kong plugins (across all namespaces):"
    local plugin_count=$(kubectl get kongplugins --all-namespaces 2>/dev/null | tail -n +2 | wc -l)
    if [ "$plugin_count" -eq 0 ]; then
        print_warning "No KongPlugin resources found yet."
        print_info "To apply plugins, run: './manage.sh apply-jwt' and './manage.sh apply-ratelimit'"
    else
        kubectl get kongplugins --all-namespaces
    fi
    
    echo ""
    print_info "Kong consumers (across all namespaces):"
    local consumer_count=$(kubectl get kongconsumers --all-namespaces 2>/dev/null | tail -n +2 | wc -l)
    if [ "$consumer_count" -eq 0 ]; then
        print_warning "No KongConsumer resources found yet."
        print_info "To create consumer, run: './manage.sh apply-jwt'"
    else
        kubectl get kongconsumers --all-namespaces
    fi
}

uninstall_kong() {
    print_section "Uninstalling Kong Ingress Controller"
    
    print_warning "This will remove Kong Ingress Controller from your cluster."
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Uninstallation cancelled"
        exit 0
    fi
    
    print_info "Uninstalling Kong Helm release..."
    helm uninstall "$HELM_RELEASE_NAME" -n "$NAMESPACE" || print_warning "Helm release not found"
    
    print_success "Kong Ingress Controller uninstalled"
}

cleanup_all() {
    print_section "Cleaning Up All Kong Resources"
    
    print_warning "This will remove ALL Kong resources including namespace, CRDs, and configurations."
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Cleanup cancelled"
        exit 0
    fi
    
    # Uninstall Kong
    print_info "Uninstalling Kong..."
    helm uninstall "$HELM_RELEASE_NAME" -n "$NAMESPACE" 2>/dev/null || print_warning "Helm release not found"
    
    # Delete namespace
    print_info "Deleting namespace: $NAMESPACE"
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    
    # Delete Gateway API CRDs (optional - be careful as other apps might use them)
    read -p "Do you want to delete Gateway API CRDs? This may affect other applications. (yes/no): " delete_crds
    if [ "$delete_crds" == "yes" ]; then
        print_info "Deleting Gateway API CRDs..."
        kubectl delete -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml --ignore-not-found=true
    fi
    
    print_success "Cleanup completed"
}

full_install() {
    print_section "Starting Full Kong Gateway Installation"
    
    check_prerequisites
    
    # Check if JWT secret exists
    if [ ! -f "$SCRIPT_DIR/jwtsecret.yaml" ]; then
        print_warning "JWT secret file (jwtsecret.yaml) not found!"
        print_info "You have the following options:"
        print_info "  1. Create it now by running: './manage.sh create-jwt-secret'"
        print_info "  2. Create it manually and place it in: $SCRIPT_DIR/jwtsecret.yaml"
        print_info "  3. Continue installation without JWT (not recommended for production)"
        echo ""
        read -p "Do you want to continue installation without JWT configuration? (yes/no): " continue_without_jwt
        
        if [ "$continue_without_jwt" != "yes" ]; then
            print_info "Installation cancelled. Please create JWT secret and run installation again."
            return 1
        fi
        print_warning "Continuing without JWT configuration..."
    fi
    
    install_gateway_api_crds
    create_gateway
    install_kong
    
    # Only apply JWT config if file exists
    if [ -f "$SCRIPT_DIR/jwtsecret.yaml" ]; then
        apply_jwt_config
    else
        print_warning "Skipping JWT configuration"
    fi
    
    apply_rate_limiting
    
    print_section "Installation Complete"
    check_status
    
    if [ ! -f "$SCRIPT_DIR/jwtsecret.yaml" ]; then
        print_warning "Kong Gateway installed without JWT authentication!"
        print_info "To add JWT authentication later, run: './manage.sh create-jwt-secret' then './manage.sh apply-jwt'"
    else
        print_success "Kong Gateway is now ready to use!"
    fi
}

show_menu() {
    clear
    print_section "Kong Gateway Management Menu"
    
    echo "1)  Full Installation (CRDs, Gateway, Kong, JWT, Rate Limiting)"
    echo "2)  Install Gateway API CRDs only"
    echo "3)  Create Gateway and GatewayClass"
    echo "4)  Install Kong Ingress Controller only"
    echo "5)  Create JWT Secret Manifest"
    echo "6)  Apply JWT Authentication Configuration"
    echo "7)  Apply Rate Limiting Configuration"
    echo "8)  Check Kong Gateway Status"
    echo "9)  Uninstall Kong Ingress Controller"
    echo "10) Cleanup All Kong Resources"
    echo "11) Show Help"
    echo "0)  Exit"
    echo ""
}

handle_menu_choice() {
    local choice=$1
    
    case $choice in
        1)
            full_install
            ;;
        2)
            check_prerequisites
            install_gateway_api_crds
            ;;
        3)
            check_prerequisites
            create_gateway
            ;;
        4)
            check_prerequisites
            install_kong
            ;;
        5)
            create_jwt_secret
            ;;
        6)
            apply_jwt_config
            ;;
        7)
            apply_rate_limiting
            ;;
        8)
            check_status
            ;;
        9)
            uninstall_kong
            ;;
        10)
            cleanup_all
            ;;
        11)
            show_help
            ;;
        0)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option: $choice"
            ;;
    esac
}

interactive_mode() {
    while true; do
        show_menu
        read -p "Enter your choice [0-11]: " choice
        echo ""
        
        handle_menu_choice "$choice"
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

show_help() {
    cat << EOF
Kong Gateway Management Script

Usage: $0 [COMMAND]

Run without arguments for interactive menu mode.

Commands:
    install            Full installation (CRDs, Gateway, Kong, JWT, Rate Limiting)
    install-crds       Install Gateway API CRDs only
    install-gateway    Create Gateway and GatewayClass
    install-kong       Install Kong Ingress Controller only
    create-jwt-secret  Create JWT secret manifest (prompts for secret)
    apply-jwt          Apply JWT authentication configuration
    apply-ratelimit    Apply rate limiting configuration
    status             Check Kong Gateway status
    uninstall          Uninstall Kong Ingress Controller
    cleanup            Remove all Kong resources (including namespace and CRDs)
    help               Show this help message

Examples:
    $0                      # Interactive menu mode
    $0 install              # Full installation
    $0 create-jwt-secret    # Create JWT secret manifest
    $0 status               # Check status
    $0 apply-jwt            # Apply JWT configuration
    $0 uninstall            # Uninstall Kong

EOF
}

# Main script logic
if [ $# -eq 0 ]; then
    # No arguments provided - run interactive menu
    interactive_mode
else
    # Arguments provided - run command directly
    case "${1}" in
        install)
            full_install
            ;;
        install-crds)
            check_prerequisites
            install_gateway_api_crds
            ;;
        install-gateway)
            check_prerequisites
            create_gateway
            ;;
        install-kong)
            check_prerequisites
            install_kong
            ;;
        create-jwt-secret)
            create_jwt_secret
            ;;
        apply-jwt)
            apply_jwt_config
            ;;
        apply-ratelimit)
            apply_rate_limiting
            ;;
        status)
            check_status
            ;;
        uninstall)
            uninstall_kong
            ;;
        cleanup)
            cleanup_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Invalid command: ${1}"
            echo ""
            show_help
            exit 1
            ;;
    esac
fi
