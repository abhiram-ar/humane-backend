#!/bin/bash

# RabbitMQ Management Script
# This script helps manage RabbitMQ cluster deployment in Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RABBITMQ_YAML="$SCRIPT_DIR/rabbitMQ.yaml"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display menu
display_menu() {
    clear
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  RabbitMQ Management Menu${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "1. Full Installation (Operator + Deploy)"
    echo "2. Install RabbitMQ Cluster Operator"
    echo "3. Deploy RabbitMQ Instance"
    echo "4. Get RabbitMQ Credentials"
    echo "5. Check RabbitMQ Status"
    echo "6. Delete RabbitMQ Instance"
    echo "7. Delete RabbitMQ Operator"
    echo "8. Exit"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

# Function to display usage (for command-line mode)
usage() {
    cat << EOF
Usage: $0 [COMMAND]

Commands:
    full-install       Full installation (operator + deploy)
    install-operator   Install RabbitMQ cluster operator
    deploy             Deploy RabbitMQ instance
    credentials        Get RabbitMQ credentials
    status             Check RabbitMQ status
    delete             Delete RabbitMQ instance
    delete-operator    Delete RabbitMQ cluster operator
    menu               Start interactive menu (default)
    help               Display this help message

Examples:
    $0 full-install
    $0 install-operator
    $0 deploy
    $0 credentials
    $0 menu

EOF
}

# Function to install RabbitMQ operator
install_operator() {
    print_info "Installing RabbitMQ cluster operator..."
    
    if kubectl get deployment rabbitmq-cluster-operator -n rabbitmq-system &> /dev/null; then
        print_warn "RabbitMQ cluster operator is already installed"
        return 0
    fi
    
    print_info "Applying operator from GitHub releases..."
    kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
    
    print_info "Waiting for operator to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/rabbitmq-cluster-operator -n rabbitmq-system
    
    print_info "RabbitMQ cluster operator installed successfully!"
}

# Function to deploy RabbitMQ instance
deploy_rabbitmq() {
    print_info "Deploying RabbitMQ instance..."
    
    # Check if operator is installed
    if ! kubectl get deployment rabbitmq-cluster-operator -n rabbitmq-system &> /dev/null; then
        print_error "RabbitMQ cluster operator is not installed. Please run: $0 install-operator"
        exit 1
    fi
    
    # Check if rabbitmq.yaml exists
    if [ ! -f "$RABBITMQ_YAML" ]; then
        print_error "rabbitmq.yaml not found at: $RABBITMQ_YAML"
        exit 1
    fi
    
    print_info "Applying rabbitmq.yaml..."
    kubectl apply -f "$RABBITMQ_YAML"
    
    print_info "RabbitMQ instance deployment initiated!"
    print_info "Run '$0 status' to check the deployment status"
}

# Function to get credentials
get_credentials() {
    print_info "Fetching RabbitMQ credentials..."
    
    # Check if the secret exists
    if ! kubectl get secret humane-rabbitmq-default-user &> /dev/null; then
        print_error "RabbitMQ secret not found. Make sure RabbitMQ is deployed."
        exit 1
    fi
    
    echo ""
    print_info "RabbitMQ Credentials:"
    echo "===================="
    
    username="$(kubectl get secret humane-rabbitmq-default-user -o jsonpath='{.data.username}' | base64 --decode)"
    echo "Username: $username"
    
    password="$(kubectl get secret humane-rabbitmq-default-user -o jsonpath='{.data.password}' | base64 --decode)"
    echo "Password: $password"
    
    service="$(kubectl get service humane-rabbitmq -o jsonpath='{.spec.clusterIP}')"
    echo "Service IP: $service"
    
    echo ""
    echo "Connection URI:"
    echo "amqp://$username:$password@$service"
    echo ""
}

# Function to check status
check_status() {
    print_info "Checking RabbitMQ status..."
    
    echo ""
    print_info "RabbitMQ Clusters:"
    kubectl get rabbitmqclusters --all-namespaces
    
    echo ""
    print_info "RabbitMQ Pods:"
    kubectl get pods -l app.kubernetes.io/component=rabbitmq --all-namespaces
    
    echo ""
    print_info "RabbitMQ Services:"
    kubectl get services -l app.kubernetes.io/component=rabbitmq --all-namespaces
}

# Function to delete RabbitMQ instance
delete_rabbitmq() {
    print_warn "This will delete the RabbitMQ instance"
    read -p "Are you sure? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_info "Deletion cancelled"
        exit 0
    fi
    
    if [ ! -f "$RABBITMQ_YAML" ]; then
        print_error "rabbitmq.yaml not found at: $RABBITMQ_YAML"
        exit 1
    fi
    
    print_info "Deleting RabbitMQ instance..."
    kubectl delete -f "$RABBITMQ_YAML"
    
    print_info "RabbitMQ instance deleted successfully!"
}

# Function to delete operator
delete_operator() {
    print_warn "This will delete the RabbitMQ cluster operator and all RabbitMQ instances"
    read -p "Are you sure? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_info "Deletion cancelled"
        exit 0
    fi
    
    print_info "Deleting RabbitMQ cluster operator..."
    kubectl delete -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
    
    print_info "RabbitMQ cluster operator deleted successfully!"
}

# Function to do full installation
full_installation() {
    print_info "Starting full RabbitMQ installation..."
    echo ""
    
    install_operator
    
    echo ""
    print_info "Waiting 10 seconds for operator to stabilize..."
    sleep 10
    
    echo ""
    deploy_rabbitmq
    
    echo ""
    print_info "Full installation completed!"
    print_info "Run '$0 credentials' to get the connection credentials"
}

# Function to pause and wait for user
pause() {
    echo ""
    read -p "Press Enter to continue..."
}

# Function to run interactive menu
interactive_menu() {
    while true; do
        display_menu
        read -p "Select an option [1-8]: " choice
        echo ""
        
        case $choice in
            1)
                full_installation
                pause
                ;;
            2)
                install_operator
                pause
                ;;
            3)
                deploy_rabbitmq
                pause
                ;;
            4)
                get_credentials
                pause
                ;;
            5)
                check_status
                pause
                ;;
            6)
                delete_rabbitmq
                pause
                ;;
            7)
                delete_operator
                pause
                ;;
            8)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-8"
                pause
                ;;
        esac
    done
}

# Main script logic
case "${1:-}" in
    full-install)
        full_installation
        ;;
    install-operator)
        install_operator
        ;;
    deploy)
        deploy_rabbitmq
        ;;
    credentials)
        get_credentials
        ;;
    status)
        check_status
        ;;
    delete)
        delete_rabbitmq
        ;;
    delete-operator)
        delete_operator
        ;;
    menu)
        interactive_menu
        ;;
    help|--help|-h)
        usage
        ;;
    "")
        # Default to interactive menu if no arguments provided
        interactive_menu
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        usage
        exit 1
        ;;
esac
