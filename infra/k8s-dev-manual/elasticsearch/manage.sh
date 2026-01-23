#!/bin/bash

# This script helps manage Elasticsearch deployment in Kubernetes

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERSISTENCE_FILE="$SCRIPT_DIR/0-elasticsearch-persistance.yaml"
STATEFUL_FILE="$SCRIPT_DIR/1-elasticsearch-stateful-srv.yaml"
NAMESPACE="default"

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
}

display_menu() {
    clear
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Elasticsearch Management Menu${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "1. Deploy Elasticsearch (Full)"
    echo "2. Deploy Persistence Only"
    echo "3. Deploy StatefulSet Only"
    echo "4. Check Status"
    echo "5. View Logs"
    echo "6. Port Forward (9200)"
    echo "7. Get Elasticsearch Info"
    echo "8. Restart Elasticsearch"
    echo "9. Delete Elasticsearch"
    echo "10. Delete All (including PV)"
    echo "0. Exit"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

deploy_persistence() {
    print_step "Deploying Elasticsearch Persistence..."
    
    if [ ! -f "$PERSISTENCE_FILE" ]; then
        print_error "Persistence file not found: $PERSISTENCE_FILE"
        exit 1
    fi
    
    DATA_PATH="/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/elasticsearch"
    if [ ! -d "$DATA_PATH" ]; then
        print_warn "Data directory does not exist: $DATA_PATH"
        read -p "Create directory? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            mkdir -p "$DATA_PATH"
            print_info "Created directory: $DATA_PATH"
        else
            print_error "Cannot proceed without data directory"
            return 1
        fi
    fi
    
    kubectl apply -f "$PERSISTENCE_FILE" -n "$NAMESPACE"
    print_info "Persistence deployed successfully"
    
    # wait for PV to be available
    print_step "Waiting for PersistentVolume to be available..."
    sleep 2
    kubectl get pv elasticsearch-pv -n "$NAMESPACE"
    kubectl get pvc elasticsearch-pvc -n "$NAMESPACE"
}

deploy_statefulset() {
    print_step "Deploying Elasticsearch StatefulSet..."
    
    if [ ! -f "$STATEFUL_FILE" ]; then
        print_error "StatefulSet file not found: $STATEFUL_FILE"
        exit 1
    fi
    
    kubectl apply -f "$STATEFUL_FILE" -n "$NAMESPACE"
    print_info "StatefulSet deployed successfully"
    
    print_step "Waiting for Elasticsearch pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n "$NAMESPACE" --timeout=300s || true
}

deploy_full() {
    print_step "Starting Full Elasticsearch Deployment..."
    echo ""
    deploy_persistence
    echo ""
    sleep 3
    deploy_statefulset
    echo ""
    print_info "Full deployment completed!"
    echo ""
    check_status
}

check_status() {
    print_step "Checking Elasticsearch Status..."
    echo ""
    
    print_info "Service Status:"
    kubectl get svc elasticsearch -n "$NAMESPACE" 2>/dev/null || print_warn "Service not found"
    echo ""
    
    print_info "StatefulSet Status:"
    kubectl get statefulset elasticsearch -n "$NAMESPACE" 2>/dev/null || print_warn "StatefulSet not found"
    echo ""
    
    print_info "Pod Status:"
    kubectl get pods -l app=elasticsearch -n "$NAMESPACE" 2>/dev/null || print_warn "Pods not found"
    echo ""
    
    print_info "PersistentVolume Status:"
    kubectl get pv elasticsearch-pv 2>/dev/null || print_warn "PV not found"
    echo ""
    
    print_info "PersistentVolumeClaim Status:"
    kubectl get pvc elasticsearch-pvc -n "$NAMESPACE" 2>/dev/null || print_warn "PVC not found"
}

view_logs() {
    print_step "Fetching Elasticsearch Logs..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=elasticsearch -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No Elasticsearch pod found"
        return 1
    fi
    
    print_info "Showing logs for pod: $POD_NAME"
    echo ""
    kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=50 -f
}

port_forward() {
    print_step "Setting up Port Forward to Elasticsearch..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=elasticsearch -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No Elasticsearch pod found"
        return 1
    fi
    
    print_info "Port forwarding pod: $POD_NAME"
    print_info "Access Elasticsearch at: http://localhost:9200"
    print_warn "Press Ctrl+C to stop port forwarding"
    echo ""
    kubectl port-forward "$POD_NAME" 9200:9200 -n "$NAMESPACE"
}

get_elasticsearch_info() {
    print_step "Getting Elasticsearch Information..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=elasticsearch -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No Elasticsearch pod found"
        return 1
    fi
    
    print_info "Elasticsearch Cluster Info:"
    kubectl exec "$POD_NAME" -n "$NAMESPACE" -- curl -s http://localhost:9200 || print_error "Failed to get cluster info"
    echo ""
    echo ""
    
    print_info "Elasticsearch Health:"
    kubectl exec "$POD_NAME" -n "$NAMESPACE" -- curl -s http://localhost:9200/_cluster/health?pretty || print_error "Failed to get health info"
    echo ""
    
    print_info "Elasticsearch Nodes:"
    kubectl exec "$POD_NAME" -n "$NAMESPACE" -- curl -s http://localhost:9200/_cat/nodes?v || print_error "Failed to get nodes info"
}

restart_elasticsearch() {
    print_step "Restarting Elasticsearch..."
    echo ""
    
    read -p "Are you sure you want to restart Elasticsearch? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restart cancelled"
        return 0
    fi
    
    print_step "Deleting Elasticsearch pods..."
    kubectl delete pods -l app=elasticsearch -n "$NAMESPACE"
    
    print_step "Waiting for pods to restart..."
    sleep 5
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n "$NAMESPACE" --timeout=300s || true
    
    print_info "Elasticsearch restarted successfully"
    echo ""
    check_status
}

delete_elasticsearch() {
    print_step "Deleting Elasticsearch Deployment..."
    echo ""
    
    read -p "Are you sure you want to delete Elasticsearch? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deletion cancelled"
        return 0
    fi
    
    print_step "Deleting StatefulSet and Service..."
    kubectl delete -f "$STATEFUL_FILE" -n "$NAMESPACE" 2>/dev/null || print_warn "StatefulSet/Service not found"
    
    print_step "Deleting PVC..."
    kubectl delete pvc elasticsearch-pvc -n "$NAMESPACE" 2>/dev/null || print_warn "PVC not found"
    
    print_info "Elasticsearch deleted successfully"
    print_warn "PersistentVolume (PV) is still retained. Use 'Delete All' to remove it."
}

delete_all() {
    print_step "Deleting All Elasticsearch Resources..."
    echo ""
    
    read -p "This will delete ALL Elasticsearch resources including data. Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deletion cancelled"
        return 0
    fi
    
    print_step "Deleting StatefulSet and Service..."
    kubectl delete -f "$STATEFUL_FILE" -n "$NAMESPACE" 2>/dev/null || print_warn "StatefulSet/Service not found"
    
    print_step "Deleting PVC..."
    kubectl delete pvc elasticsearch-pvc -n "$NAMESPACE" 2>/dev/null || print_warn "PVC not found"
    
    print_step "Deleting PV..."
    kubectl delete pv elasticsearch-pv 2>/dev/null || print_warn "PV not found"
    
    print_info "All Elasticsearch resources deleted successfully"
    print_warn "Data directory still exists. Manually delete if needed."
}

# main menu loop
main() {
    check_kubectl
    
    # check if running in non-interactive mode
    if [ $# -gt 0 ]; then
        case $1 in
            deploy-full)
                deploy_full
                ;;
            deploy-persistence)
                deploy_persistence
                ;;
            deploy-statefulset)
                deploy_statefulset
                ;;
            status)
                check_status
                ;;
            logs)
                view_logs
                ;;
            port-forward)
                port_forward
                ;;
            info)
                get_elasticsearch_info
                ;;
            restart)
                restart_elasticsearch
                ;;
            delete)
                delete_elasticsearch
                ;;
            delete-all)
                delete_all
                ;;
            *)
                echo "Usage: $0 {deploy-full|deploy-persistence|deploy-statefulset|status|logs|port-forward|info|restart|delete|delete-all}"
                exit 1
                ;;
        esac
        exit 0
    fi
    
    # Interactive menu mode
    while true; do
        display_menu
        read -p "Enter your choice [0-10]: " choice
        
        case $choice in
            1)
                deploy_full
                ;;
            2)
                deploy_persistence
                ;;
            3)
                deploy_statefulset
                ;;
            4)
                check_status
                ;;
            5)
                view_logs
                ;;
            6)
                port_forward
                ;;
            7)
                get_elasticsearch_info
                ;;
            8)
                restart_elasticsearch
                ;;
            9)
                delete_elasticsearch
                ;;
            10)
                delete_all
                ;;
            0)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        if [ "$choice" != "5" ] && [ "$choice" != "6" ]; then
            echo ""
            read -p "Press Enter to continue..."
        fi
    done
}

# entrypoint
main "$@"
