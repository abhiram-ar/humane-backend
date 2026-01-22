#!/bin/bash

# MongoDB Replica Set Management Script
# Interactive menu-driven deployment and maintenance

set -e

# ===================================
# CONFIGURATION - Edit these values
# ===================================
NAMESPACE="default"
REPLICA_COUNT=3
PERSISTENCE_FILE="0-mongo-peristance.yaml"
NODEPORT_SERVICE_FILE="03-service-nodeport.yaml"
STORAGE_BASE_PATH="/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_msg() {
    color=$1
    shift
    echo -e "${color}$@${NC}"
}

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
        print_msg $RED "Error: kubectl is not installed or not in PATH"
        exit 1
    fi
}

# Generate persistence manifest with configured storage path
generate_persistence_manifest() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Generating Persistence Manifest"
    print_msg $BLUE "======================================="
    
    print_info "Storage base path: $STORAGE_BASE_PATH"
    print_step "Generating $PERSISTENCE_FILE..."
    
    cat > "$PERSISTENCE_FILE" << EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv-0
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: $STORAGE_BASE_PATH/mongo-0
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv-1
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: $STORAGE_BASE_PATH/mongo-1
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongo-pv-2
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: $STORAGE_BASE_PATH/mongo-2
EOF
    
    print_msg $GREEN "Persistence manifest generated successfully!"
    print_info "File: $PERSISTENCE_FILE"
    echo ""
    print_msg $YELLOW "PersistentVolume paths:"
    for i in $(seq 0 $((REPLICA_COUNT - 1))); do
        print_msg $GREEN "  mongo-pv-$i: $STORAGE_BASE_PATH/mongo-$i"
    done
}

install_mongodb() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Installing MongoDB Replica Set"
    print_msg $BLUE "======================================="
    
    # Generate persistence manifest if needed
    if [ ! -f "$PERSISTENCE_FILE" ]; then
        print_warn "Persistence file not found. Generating from configured storage path..."
        generate_persistence_manifest
        echo ""
    fi
    
    if [ -f "$PERSISTENCE_FILE" ]; then
        print_step "Creating PersistentVolumes..."
        
        print_step "Creating storage directories at: $STORAGE_BASE_PATH"
        for i in $(seq 0 $((REPLICA_COUNT - 1))); do
            MONGO_DIR="$STORAGE_BASE_PATH/mongo-$i"
            if [ ! -d "$MONGO_DIR" ]; then
                mkdir -p "$MONGO_DIR"
                print_info "Created directory: $MONGO_DIR"
            else
                print_info "Directory already exists: $MONGO_DIR"
            fi
        done
        
        kubectl apply -f $PERSISTENCE_FILE -n $NAMESPACE
        sleep 2
    else
        print_warn "Persistence file not found, using dynamic provisioning..."
    fi
    
    print_step "Creating headless service..."
    kubectl apply -f 02-service-headless.yaml -n $NAMESPACE
    
    print_step "Creating StatefulSet with $REPLICA_COUNT replicas..."
    kubectl apply -f 04-statefulset.yaml -n $NAMESPACE
    
    print_step "Waiting for MongoDB pods to be ready..."
    for i in $(seq 0 $((REPLICA_COUNT - 1))); do
        print_info "Waiting for mongo-$i..."
        kubectl wait --for=condition=ready pod/mongo-$i -n $NAMESPACE --timeout=300s || true
    done
    
    print_msg $GREEN "MongoDB StatefulSet deployed successfully!"
    echo ""
    print_info "Next steps:"
    print_info "1. Initialize replica set: Select option 2 from menu"
    print_info "2. Or run: ./manage.sh init-replica"
}

# Initialize replica set using Job
init_replica() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Initializing MongoDB Replica Set (Job)"
    print_msg $BLUE "======================================="
    
    # Check if job already exists
    if kubectl get job mongo-init -n $NAMESPACE &> /dev/null; then
        print_msg $YELLOW "Deleting existing mongo-init job..."
        kubectl delete job mongo-init -n $NAMESPACE
        sleep 2
    fi
    
    # Apply the initialization job
    print_msg $YELLOW "Running replica set initialization job..."
    kubectl apply -f 05-job\(runWhenRequired\).yaml -n $NAMESPACE
    
    # Wait for job to complete
    print_msg $YELLOW "Waiting for initialization to complete..."
    kubectl wait --for=condition=complete job/mongo-init -n $NAMESPACE --timeout=120s || {
        print_msg $RED "Job did not complete in time. Checking logs..."
        kubectl logs job/mongo-init -n $NAMESPACE -c mongo-init --tail=50
        exit 1
    }
    
    print_msg $GREEN "Replica set initialized successfully!"
    print_msg $YELLOW "Checking replica set status..."
    kubectl exec mongo-0 -n $NAMESPACE -- mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr))"
}

# Manual initialization instructions
manual_init() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Manual Replica Set Initialization"
    print_msg $BLUE "======================================="
    
    print_msg $YELLOW "\nManual initialization steps:"
    print_msg $YELLOW "1. Get into mongo-0 pod:"
    print_msg $GREEN "   kubectl exec -it mongo-0 -n $NAMESPACE -- bash"
    
    print_msg $YELLOW "\n2. Open MongoDB shell:"
    print_msg $GREEN "   mongosh"
    
    print_msg $YELLOW "\n3. Initialize replica set:"
    print_msg $GREEN "   rs.initiate({"
    print_msg $GREEN "     _id: \"rs0\","
    print_msg $GREEN "     members: ["
    print_msg $GREEN "       { _id: 0, host: \"mongo-0.mongo:27017\" },"
    print_msg $GREEN "       { _id: 1, host: \"mongo-1.mongo:27017\" },"
    print_msg $GREEN "       { _id: 2, host: \"mongo-2.mongo:27017\" }"
    print_msg $GREEN "     ]"
    print_msg $GREEN "   })"
    
    print_msg $YELLOW "\n4. Check replica set status:"
    print_msg $GREEN "   rs.status()"
    
    print_msg $YELLOW "\nOr use this one-liner from your terminal:"
    print_msg $GREEN "kubectl exec -it mongo-0 -n $NAMESPACE -- mongosh --eval 'rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongo-0.mongo:27017\"},{_id:1,host:\"mongo-1.mongo:27017\"},{_id:2,host:\"mongo-2.mongo:27017\"}]})'"
}

# Check status of MongoDB replica set
status() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "MongoDB Replica Set Status"
    print_msg $BLUE "======================================="
    
    print_msg $YELLOW "\n=== Pods Status ==="
    kubectl get pods -n $NAMESPACE -l app=mongo -o wide
    
    print_msg $YELLOW "\n=== Services ==="
    kubectl get svc -n $NAMESPACE -l app=mongo
    
    print_msg $YELLOW "\n=== StatefulSet ==="
    kubectl get statefulset mongo -n $NAMESPACE
    
    print_msg $YELLOW "\n=== PersistentVolumes ==="
    kubectl get pv -n $NAMESPACE | grep -E "NAME|mongo" || echo "No custom PV found (using dynamic provisioning)"
    
    print_msg $YELLOW "\n=== PVCs ==="
    kubectl get pvc -n $NAMESPACE | grep -E "NAME|mongo" || echo "No PVCs found"
    
    # Check if mongo-0 is ready
    if kubectl get pod mongo-0 -n $NAMESPACE &> /dev/null && kubectl exec mongo-0 -n $NAMESPACE -- mongosh --quiet --eval "db.version()" &> /dev/null; then
        print_msg $YELLOW "\n=== Replica Set Status ==="
        kubectl exec mongo-0 -n $NAMESPACE -- mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ': ' + m.stateStr))" || print_msg $RED "Replica set not initialized yet"
        
        print_msg $YELLOW "\n=== Replica Set Configuration ==="
        kubectl exec mongo-0 -n $NAMESPACE -- mongosh --quiet --eval "rs.conf()" || print_msg $RED "Replica set not initialized yet"
    else
        print_msg $RED "Cannot connect to MongoDB pods yet"
    fi
}

# Show logs
logs() {
    echo ""
    echo "Select pod to view logs:"
    for i in $(seq 0 $((REPLICA_COUNT - 1))); do
        echo "  $((i + 1)). mongo-$i"
    done
    read -p "Select pod (1-$REPLICA_COUNT): " pod_choice
    
    if [[ "$pod_choice" =~ ^[0-9]+$ ]] && [ "$pod_choice" -ge 1 ] && [ "$pod_choice" -le "$REPLICA_COUNT" ]; then
        POD="mongo-$((pod_choice - 1))"
        print_info "Showing logs for $POD..."
        kubectl logs $POD -n $NAMESPACE --tail=100 -f
    else
        print_error "Invalid choice"
    fi
}

# Restart MongoDB pods
restart() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Restarting MongoDB Replica Set"
    print_msg $BLUE "======================================="
    
    print_msg $YELLOW "Rolling restart of MongoDB pods..."
    for i in $(seq $((REPLICA_COUNT - 1)) -1 0); do
        POD="mongo-$i"
        print_msg $YELLOW "Deleting pod $POD..."
        kubectl delete pod $POD -n $NAMESPACE
        
        print_msg $YELLOW "Waiting for pod $POD to be ready..."
        kubectl wait --for=condition=ready pod/$POD -n $NAMESPACE --timeout=120s
        
        print_msg $GREEN "Pod $POD is ready"
        sleep 5
    done
    
    print_msg $GREEN "All pods restarted successfully!"
}

# Uninstall MongoDB replica set
uninstall() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Uninstalling MongoDB Replica Set"
    print_msg $BLUE "======================================="
    
    print_msg $RED "This will delete all MongoDB data!"
    read -p "Are you sure? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        print_msg $YELLOW "Aborted."
        exit 0
    fi
    
    # Delete job if exists
    if kubectl get job mongo-init -n $NAMESPACE &> /dev/null; then
        print_msg $YELLOW "Deleting initialization job..."
        kubectl delete job mongo-init -n $NAMESPACE || true
    fi
    
    # Delete StatefulSet
    print_msg $YELLOW "Deleting StatefulSet..."
    kubectl delete -f 04-statefulset.yaml -n $NAMESPACE || true
    
    # Delete services
    print_msg $YELLOW "Deleting headless service..."
    kubectl delete -f 02-service-headless.yaml -n $NAMESPACE || true
    
    if [ -f "$NODEPORT_SERVICE_FILE" ]; then
        print_msg $YELLOW "Deleting NodePort services..."
        kubectl delete -f $NODEPORT_SERVICE_FILE -n $NAMESPACE 2>/dev/null || true
    fi
    
    # Delete PVCs
    print_msg $YELLOW "Deleting PVCs..."
    kubectl delete pvc -l app=mongo -n $NAMESPACE || true
    
    # Delete persistence (PV and PVC) if file exists
    if [ -f "$PERSISTENCE_FILE" ]; then
        print_msg $YELLOW "Deleting PersistentVolume and PersistentVolumeClaim..."
        kubectl delete -f $PERSISTENCE_FILE -n $NAMESPACE || true
    fi
    
    print_msg $GREEN "MongoDB uninstalled successfully!"
}

# Test connection
test_connection() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Testing MongoDB Connection"
    print_msg $BLUE "======================================="
    
    print_msg $YELLOW "Testing connection to mongo-0..."
    kubectl exec mongo-0 -n $NAMESPACE -- mongosh --quiet --eval "print('MongoDB version: ' + db.version()); print('Connection successful!')"
    
    print_msg $YELLOW "\nTesting replica set connection string..."
    print_msg $GREEN "Connection string: mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0"
}

# Enable external access via NodePort
enable_external_access() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Enabling External Access"
    print_msg $BLUE "======================================="
    
    if [ ! -f "$NODEPORT_SERVICE_FILE" ]; then
        print_error "NodePort service file not found: $NODEPORT_SERVICE_FILE"
        return 1
    fi
    
    print_step "Creating NodePort services..."
    kubectl apply -f $NODEPORT_SERVICE_FILE -n $NAMESPACE
    
    print_msg $GREEN "\nExternal access enabled!"
    show_connection_info
}

# Disable external access
disable_external_access() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Disabling External Access"
    print_msg $BLUE "======================================="
    
    if [ -f "$NODEPORT_SERVICE_FILE" ]; then
        print_step "Deleting NodePort services..."
        kubectl delete -f $NODEPORT_SERVICE_FILE -n $NAMESPACE 2>/dev/null || print_warn "NodePort services not found"
        print_msg $GREEN "External access disabled"
    else
        print_warn "NodePort service file not found"
    fi
}

# Show connection information
show_connection_info() {
    print_msg $BLUE "\n======================================="
    print_msg $BLUE "Connection Information"
    print_msg $BLUE "======================================="
    
    echo ""
    print_info "Internal Connection (from within cluster):"
    print_msg $GREEN "  mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0"
    
    echo ""
    if kubectl get svc mongo-nodeport-0 -n $NAMESPACE &>/dev/null; then
        print_info "External Connection with Replica Discovery (Recommended):"
        print_msg $YELLOW "  First, add these entries to /etc/hosts:"
        print_msg $GREEN "    127.0.0.1 mongo-0.mongo"
        print_msg $GREEN "    127.0.0.1 mongo-1.mongo"
        print_msg $GREEN "    127.0.0.1 mongo-2.mongo"
        print_msg $YELLOW "  Then use this connection string:"
        print_msg $GREEN "  mongodb://mongo-0.mongo:30017,mongo-1.mongo:30018,mongo-2.mongo:30019/?replicaSet=rs0"
        echo ""
        print_info "External Direct Connection (No replica discovery):"
        print_msg $GREEN "  mongodb://localhost:30017/?directConnection=true"
        echo ""
        print_info "NodePort Services Status:"
        kubectl get svc -n $NAMESPACE | grep mongo-nodeport
    else
        print_warn "External access not enabled. Run 'Enable External Access' from menu."
    fi
}

# Add hosts file entries helper
add_hosts_entries() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Add /etc/hosts Entries"
    print_msg $BLUE "======================================="
    echo ""
    print_info "To enable replica set discovery from MongoDB Compass,"
    print_info "you need to add these entries to your /etc/hosts file:"
    echo ""
    print_msg $GREEN "127.0.0.1 mongo-0.mongo"
    print_msg $GREEN "127.0.0.1 mongo-1.mongo"
    print_msg $GREEN "127.0.0.1 mongo-2.mongo"
    echo ""
    print_info "Quick command (Linux/Mac):"
    print_msg $YELLOW "sudo bash -c 'cat >> /etc/hosts << EOF"
    print_msg $YELLOW "127.0.0.1 mongo-0.mongo"
    print_msg $YELLOW "127.0.0.1 mongo-1.mongo"
    print_msg $YELLOW "127.0.0.1 mongo-2.mongo"
    print_msg $YELLOW "EOF'"
    echo ""
    print_info "Windows (Run PowerShell as Administrator):"
    print_msg $YELLOW "Add-Content -Path C:\\Windows\\System32\\drivers\\etc\\hosts -Value '127.0.0.1 mongo-0.mongo'"
    print_msg $YELLOW "Add-Content -Path C:\\Windows\\System32\\drivers\\etc\\hosts -Value '127.0.0.1 mongo-1.mongo'"
    print_msg $YELLOW "Add-Content -Path C:\\Windows\\System32\\drivers\\etc\\hosts -Value '127.0.0.1 mongo-2.mongo'"
    echo ""
    read -p "Do you want to add these entries now? (requires sudo) [y/N]: " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
            sudo bash -c 'cat >> /etc/hosts << EOF
127.0.0.1 mongo-0.mongo
127.0.0.1 mongo-1.mongo
127.0.0.1 mongo-2.mongo
EOF'
            print_msg $GREEN "Entries added successfully!"
            print_info "You can now use: mongodb://mongo-0.mongo:30017,mongo-1.mongo:30018,mongo-2.mongo:30019/?replicaSet=rs0"
        else
            print_warn "Automatic addition not supported on this OS. Please add manually."
        fi
    else
        print_info "Please add the entries manually to use full replica set features."
    fi
}

# Port forward to MongoDB
port_forward() {
    print_msg $BLUE "======================================="
    print_msg $BLUE "Port Forwarding to MongoDB"
    print_msg $BLUE "======================================="
    
    echo ""
    echo "Select MongoDB pod to forward:"
    for i in $(seq 0 $((REPLICA_COUNT - 1))); do
        echo "  $((i + 1)). mongo-$i (localhost:$((27017 + i)))"
    done
    echo "  $((REPLICA_COUNT + 1)). Forward all pods"
    echo ""
    read -p "Select option (1-$((REPLICA_COUNT + 1))): " choice
    
    if [ "$choice" -eq "$((REPLICA_COUNT + 1))" ]; then
        print_info "Starting port forward for all pods..."
        print_warn "Press Ctrl+C to stop all port forwards"
        echo ""
        for i in $(seq 0 $((REPLICA_COUNT - 1))); do
            LOCAL_PORT=$((27017 + i))
            print_info "Forwarding mongo-$i to localhost:$LOCAL_PORT"
            kubectl port-forward mongo-$i $LOCAL_PORT:27017 -n $NAMESPACE &
        done
        echo ""
        print_msg $GREEN "Connection strings:"
        for i in $(seq 0 $((REPLICA_COUNT - 1))); do
            LOCAL_PORT=$((27017 + i))
            print_msg $GREEN "  mongo-$i: mongodb://localhost:$LOCAL_PORT/?directConnection=true"
        done
        echo ""
        print_warn "Press Ctrl+C to stop"
        wait
    elif [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "$REPLICA_COUNT" ]; then
        POD_INDEX=$((choice - 1))
        POD="mongo-$POD_INDEX"
        LOCAL_PORT=$((27017 + POD_INDEX))
        
        print_info "Starting port forward: $POD -> localhost:$LOCAL_PORT"
        print_msg $GREEN "Connection string: mongodb://localhost:$LOCAL_PORT/?directConnection=true"
        print_warn "Press Ctrl+C to stop"
        kubectl port-forward $POD $LOCAL_PORT:27017 -n $NAMESPACE
    else
        print_error "Invalid choice"
    fi
}


show_menu() {
    echo ""
    echo "======================================"
    echo "  MongoDB Replica Set Manager"
    echo "======================================"
    echo ""
    echo "Deployment:"
    echo "  1. Deploy MongoDB Replica Set"
    echo "  2. Initialize Replica Set (Automatic)"
    echo "  3. Show Manual Init Instructions"
    echo ""
    echo "Configuration:"
    echo "  4. Generate Persistence Manifest"
    echo ""
    echo "Monitoring:"
    echo "  5. Show Status"
    echo "  6. View Logs"
    echo "  7. Test Connection"
    echo ""
    echo "External Access (MongoDB Compass):"
    echo "  8. Enable External Access (NodePort)"
    echo "  9. Disable External Access"
    echo " 10. Show Connection Info"
    echo " 11. Add /etc/hosts Entries (for replica discovery)"
    echo " 12. Port Forward (localhost)"
    echo ""
    echo "Maintenance:"
    echo " 13. Restart MongoDB Pods"
    echo ""
    echo "Cleanup:"
    echo " 14. Uninstall MongoDB"
    echo " 15. Exit"
    echo ""
    echo "Storage Path: $STORAGE_BASE_PATH"
    echo ""
}

# Main loop
main() {
    check_kubectl
    
    # If arguments provided, run in command mode 
    if [ $# -gt 0 ]; then
        case ${1} in
            install)
                install_mongodb
                ;;
            init-replica|init)
                init_replica
                ;;
            manual-init|manual)
                manual_init
                ;;
            generate-manifest|generate)
                generate_persistence_manifest
                ;;
            status)
                status
                ;;
            logs)
                logs
                ;;
            restart)
                restart
                ;;
            test|test-connection)
                test_connection
                ;;
            enable-external)
                enable_external_access
                ;;
            disable-external)
                disable_external_access
                ;;
            connection-info|info)
                show_connection_info
                ;;   
           add-hosts)
                add_hosts_entries
                ;;
            port-forward|pf)
                port_forward
                ;;
            uninstall|delete)
                uninstall
                ;;
            menu|help|*)
                show_menu
                ;;
        esac
        exit 0
    fi
    
    # Interactive menu mode
    while true; do
        show_menu
        read -p "Select an option (1-15): " choice
        
        case $choice in
            1)
                install_mongodb
                ;;
            2)
                init_replica
                ;;
            3)
                manual_init
                ;;
            4)
                generate_persistence_manifest
                ;;
            5)
                status
                ;;
            6)
                logs
                ;;
            7)
                test_connection
                ;;
            8)
                enable_external_access
                ;;
            9)
                disable_external_access
                ;;
            10)
                show_connection_info
                ;;
            11)
                add_hosts_entries
                ;;
            12)
                port_forward
                ;;
            13)
                restart
                ;;
            14)
                uninstall
                ;;
            15)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-15"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# entry point
main "$@"
