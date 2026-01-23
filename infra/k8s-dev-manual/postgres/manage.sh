#!/bin/bash

# PostgreSQL Management Script
# Interactive menu-driven deployment and maintenance

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRET_FILE="$SCRIPT_DIR/0-user-postgres.secret.yaml"
PERSISTENCE_FILE="$SCRIPT_DIR/1-user-postgres-persistance.yaml"
STATEFUL_FILE="$SCRIPT_DIR/2-user-postgres-stateful-srv.yaml"
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
    echo -e "${GREEN}  PostgreSQL Management Menu${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "1. Deploy PostgreSQL (Full)"
    echo "2. Create Secret Manifest"
    echo "3. Deploy Secret Only"
    echo "4. Deploy Persistence Only"
    echo "5. Deploy StatefulSet Only"
    echo "6. Check Status"
    echo "7. View Logs"
    echo "8. Port Forward (5432)"
    echo "9. Connect to PostgreSQL (psql)"
    echo "10. Restart PostgreSQL"
    echo "11. Delete PostgreSQL"
    echo "12. Delete All (including PV)"
    echo "0. Exit"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

create_secret_manifest() {
    print_step "Creating PostgreSQL Secret Manifest..."
    echo ""
    
    # Check if secret file already exists
    if [ -f "$SECRET_FILE" ]; then
        print_warn "Secret file already exists: $SECRET_FILE"
        read -p "Do you want to overwrite it? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled"
            return 0
        fi
    fi
    
    # Get database name
    read -p "Enter database name (default: user-db): " DB_NAME
    DB_NAME=${DB_NAME:-user-db}
    
    # Get username
    read -p "Enter PostgreSQL username (default: postgres): " USERNAME
    USERNAME=${USERNAME:-postgres}
    
    # Get password
    while true; do
        read -s -p "Enter PostgreSQL password: " PASSWORD
        echo
        if [ -z "$PASSWORD" ]; then
            print_error "Password cannot be empty"
            continue
        fi
        read -s -p "Confirm password: " PASSWORD_CONFIRM
        echo
        if [ "$PASSWORD" == "$PASSWORD_CONFIRM" ]; then
            break
        else
            print_error "Passwords do not match. Please try again."
        fi
    done
    
    # Get PGDATA path
    read -p "Enter PGDATA path (default: /var/lib/postgresql/data/pgdata): " PGDATA
    PGDATA=${PGDATA:-/var/lib/postgresql/data/pgdata}
    
    # Create the secret manifest
    cat > "$SECRET_FILE" << EOF
apiVersion: v1
kind: Secret
metadata:
  name: user-postgres-secret
type: Opaque
stringData:
  POSTGRES_USER: "$USERNAME"
  POSTGRES_PASSWORD: "$PASSWORD"
  POSTGRES_DB: "$DB_NAME"
  PGDATA: "$PGDATA"
EOF
    
    print_info "Secret manifest created successfully: $SECRET_FILE"
    echo ""
    print_info "Summary:"
    echo "  Database: $DB_NAME"
    echo "  Username: $USERNAME"
    echo "  PGDATA: $PGDATA"
    echo ""
    print_warn "Remember to keep this file secure and add it to .gitignore!"
}

deploy_secret() {
    print_step "Deploying PostgreSQL Secret..."
    
    if [ ! -f "$SECRET_FILE" ]; then
        print_error "Secret file not found: $SECRET_FILE"
        echo ""
        read -p "Would you like to create it now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_secret_manifest
            if [ ! -f "$SECRET_FILE" ]; then
                return 1
            fi
        else
            return 1
        fi
    fi
    
    # Check if secret already exists
    if kubectl get secret user-postgres-secret -n "$NAMESPACE" &> /dev/null; then
        print_warn "Secret already exists in the cluster"
        read -p "Do you want to replace it? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kubectl delete secret user-postgres-secret -n "$NAMESPACE"
            print_info "Existing secret deleted"
        else
            print_info "Using existing secret"
            return 0
        fi
    fi
    
    kubectl apply -f "$SECRET_FILE" -n "$NAMESPACE"
    print_info "Secret deployed successfully"
}

deploy_persistence() {
    print_step "Deploying PostgreSQL Persistence..."
    
    if [ ! -f "$PERSISTENCE_FILE" ]; then
        print_error "Persistence file not found: $PERSISTENCE_FILE"
        return 1
    fi
    
    # Extract the hostPath from the PV definition
    DATA_PATH=$(grep -A 10 "type: DirectoryOrCreate" "$PERSISTENCE_FILE" | grep "path:" | awk '{print $2}' | tr -d '"' | head -1)
    
    if [ -n "$DATA_PATH" ] && [ ! -d "$DATA_PATH" ]; then
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
    
    # Wait for PV to be available
    print_step "Waiting for PersistentVolume to be available..."
    sleep 2
    kubectl get pv user-postgres-pv -n "$NAMESPACE" 2>/dev/null || true
    kubectl get pvc user-postgres-pvc -n "$NAMESPACE" 2>/dev/null || true
}

deploy_statefulset() {
    print_step "Deploying PostgreSQL StatefulSet..."
    
    if [ ! -f "$STATEFUL_FILE" ]; then
        print_error "StatefulSet file not found: $STATEFUL_FILE"
        return 1
    fi
    
    kubectl apply -f "$STATEFUL_FILE" -n "$NAMESPACE"
    print_info "StatefulSet deployed successfully"
    
    print_step "Waiting for PostgreSQL pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=user-postgres -n "$NAMESPACE" --timeout=300s || {
        print_warn "Pod is not ready yet. Check status with option 6"
    }
}

deploy_full() {
    print_step "Starting Full PostgreSQL Deployment..."
    echo ""
    
    # Deploy secret
    deploy_secret
    echo ""
    sleep 2
    
    # Deploy persistence
    deploy_persistence
    echo ""
    sleep 3
    
    # Deploy statefulset
    deploy_statefulset
    echo ""
    
    print_info "Full deployment completed!"
    echo ""
    check_status
}

check_status() {
    print_step "Checking PostgreSQL Status..."
    echo ""
    
    print_info "Secret:"
    kubectl get secret user-postgres-secret -n "$NAMESPACE" 2>/dev/null || print_warn "Secret not found"
    echo ""
    
    print_info "PersistentVolume:"
    kubectl get pv user-postgres-pv 2>/dev/null || print_warn "PV not found"
    echo ""
    
    print_info "PersistentVolumeClaim:"
    kubectl get pvc user-postgres-pvc -n "$NAMESPACE" 2>/dev/null || print_warn "PVC not found"
    echo ""
    
    print_info "Service:"
    kubectl get svc user-postgres -n "$NAMESPACE" 2>/dev/null || print_warn "Service not found"
    echo ""
    
    print_info "StatefulSet:"
    kubectl get statefulset user-postgres -n "$NAMESPACE" 2>/dev/null || print_warn "StatefulSet not found"
    echo ""
    
    print_info "Pods:"
    kubectl get pods -l app=user-postgres -n "$NAMESPACE" 2>/dev/null || print_warn "No pods found"
    echo ""
}

view_logs() {
    print_step "Fetching PostgreSQL Logs..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=user-postgres -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No PostgreSQL pod found"
        return 1
    fi
    
    print_info "Showing logs for pod: $POD_NAME"
    echo ""
    read -p "Press Enter to start viewing logs (Ctrl+C to exit)..."
    kubectl logs -f "$POD_NAME" -n "$NAMESPACE"
}

port_forward() {
    print_step "Setting up Port Forward to PostgreSQL..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=user-postgres -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No PostgreSQL pod found"
        return 1
    fi
    
    LOCAL_PORT=5432
    read -p "Enter local port (default: 5432): " INPUT_PORT
    if [ -n "$INPUT_PORT" ]; then
        LOCAL_PORT=$INPUT_PORT
    fi
    
    print_info "Port forwarding localhost:$LOCAL_PORT -> $POD_NAME:5432"
    print_info "Press Ctrl+C to stop port forwarding"
    echo ""
    kubectl port-forward "$POD_NAME" "$LOCAL_PORT:5432" -n "$NAMESPACE"
}

connect_psql() {
    print_step "Connecting to PostgreSQL..."
    echo ""
    
    POD_NAME=$(kubectl get pods -l app=user-postgres -n "$NAMESPACE" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
    
    if [ -z "$POD_NAME" ]; then
        print_error "No PostgreSQL pod found"
        return 1
    fi
    
    # Get database name from secret
    DB_NAME=$(kubectl get secret user-postgres-secret -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_DB}' 2>/dev/null | base64 -d)
    DB_NAME=${DB_NAME:-postgres}
    
    # Get username from secret
    USERNAME=$(kubectl get secret user-postgres-secret -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_USER}' 2>/dev/null | base64 -d)
    USERNAME=${USERNAME:-postgres}
    
    print_info "Connecting to database: $DB_NAME as user: $USERNAME"
    print_info "Type '\q' to exit psql"
    echo ""
    
    kubectl exec -it "$POD_NAME" -n "$NAMESPACE" -- psql -U "$USERNAME" -d "$DB_NAME"
}

restart_postgres() {
    print_step "Restarting PostgreSQL..."
    echo ""
    
    read -p "Are you sure you want to restart PostgreSQL? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operation cancelled"
        return 0
    fi
    
    kubectl rollout restart statefulset user-postgres -n "$NAMESPACE"
    print_info "Restart initiated"
    
    print_step "Waiting for pod to be ready..."
    kubectl wait --for=condition=ready pod -l app=user-postgres -n "$NAMESPACE" --timeout=300s || true
    
    echo ""
    check_status
}

delete_postgres() {
    print_step "Deleting PostgreSQL (keeping PV)..."
    echo ""
    
    print_warn "This will delete the StatefulSet and Service but keep the data"
    read -p "Are you sure? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operation cancelled"
        return 0
    fi
    
    if [ -f "$STATEFUL_FILE" ]; then
        kubectl delete -f "$STATEFUL_FILE" -n "$NAMESPACE" 2>/dev/null || true
    else
        kubectl delete statefulset user-postgres -n "$NAMESPACE" 2>/dev/null || true
        kubectl delete svc user-postgres -n "$NAMESPACE" 2>/dev/null || true
    fi
    
    print_info "PostgreSQL deleted successfully"
}

delete_all() {
    print_step "Deleting All PostgreSQL Resources..."
    echo ""
    
    print_error "WARNING: This will delete ALL resources including persistent data!"
    read -p "Are you ABSOLUTELY sure? Type 'yes' to confirm: " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        print_info "Operation cancelled"
        return 0
    fi
    
    print_step "Deleting StatefulSet and Service..."
    kubectl delete -f "$STATEFUL_FILE" -n "$NAMESPACE" 2>/dev/null || true
    
    print_step "Deleting PVC and PV..."
    kubectl delete -f "$PERSISTENCE_FILE" -n "$NAMESPACE" 2>/dev/null || true
    
    print_step "Deleting Secret..."
    kubectl delete -f "$SECRET_FILE" -n "$NAMESPACE" 2>/dev/null || true
    
    print_info "All resources deleted successfully"
}

main() {
    check_kubectl
    
    while true; do
        display_menu
        read -p "Select an option: " choice
        echo ""
        
        case $choice in
            1)
                deploy_full
                ;;
            2)
                create_secret_manifest
                ;;
            3)
                deploy_secret
                ;;
            4)
                deploy_persistence
                ;;
            5)
                deploy_statefulset
                ;;
            6)
                check_status
                ;;
            7)
                view_logs
                ;;
            8)
                port_forward
                ;;
            9)
                connect_psql
                ;;
            10)
                restart_postgres
                ;;
            11)
                delete_postgres
                ;;
            12)
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
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

main
