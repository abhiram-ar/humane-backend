#!/bin/bash

# Kafka Deployment & Maintenance Script
# Uses existing manifest files to deploy and manage Kafka

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="default"
KAFKA_PERSISTENCE_FILE="kafka-persitance.yaml"
KAFKA_SRV_FILE="kafka-srv.yaml"
KAFKA_UI_SRV_FILE="kafka-ui-srv.yaml"

# Kafka Topics to create
KAFKA_TOPICS=(
    "user.password-recovery-request.events"
    "user.signup.events"
    "user.profile.events"
    "friendship.events"
    "post.create.events"
    "post.updated.events"
    "post.deleted.events"
    "comment.created.events"
    "comment.delted.events"
    "comment.like.request"
    "comment.unlike.request"
    "comment.liked.events"
    "comment.unliked.events"
    "comment.liked.by.post.author.events"
    "moderation.events"
    "moderation.retry.events"
    "reward.events"
    "message.events"
    "message.special.events"
)

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if kubectl is installed
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
}

# Function to check if manifest files exist
check_manifest_files() {
    local missing_files=()
    
    if [ ! -f "$KAFKA_PERSISTENCE_FILE" ]; then
        missing_files+=("$KAFKA_PERSISTENCE_FILE")
    fi
    
    if [ ! -f "$KAFKA_SRV_FILE" ]; then
        missing_files+=("$KAFKA_SRV_FILE")
    fi
    
    if [ ! -f "$KAFKA_UI_SRV_FILE" ]; then
        missing_files+=("$KAFKA_UI_SRV_FILE")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing manifest files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    print_info "All required manifest files found"
}

# Function to deploy Kafka
deploy_kafka() {
    print_step "Deploying Kafka PersistentVolume and PersistentVolumeClaim..."
    kubectl apply -f "$KAFKA_PERSISTENCE_FILE"
    
    print_step "Deploying Kafka Service and Deployment..."
    kubectl apply -f "$KAFKA_SRV_FILE"
    
    print_info "Kafka deployed successfully"
}

# Function to deploy Kafka UI
deploy_kafka_ui() {
    print_step "Deploying Kafka UI..."
    kubectl apply -f "$KAFKA_UI_SRV_FILE"
    print_info "Kafka UI deployed successfully"
}

# Function to wait for Kafka to be ready
wait_for_kafka() {
    print_info "Waiting for Kafka to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/kafka -n $NAMESPACE 2>/dev/null || {
        print_warn "Timeout waiting for Kafka. Checking status..."
        kubectl get pods -n $NAMESPACE | grep kafka
    }
}

# Function to wait for Kafka UI to be ready
wait_for_kafka_ui() {
    print_info "Waiting for Kafka UI to be ready..."
    kubectl wait --for=condition=available --timeout=120s deployment/kafka-ui -n $NAMESPACE 2>/dev/null || {
        print_warn "Timeout waiting for Kafka UI. Checking status..."
        kubectl get pods -n $NAMESPACE | grep kafka-ui
    }
}

# Function to create Kafka topics
create_kafka_topics() {
    print_step "Creating Kafka topics..."
    
    # Get Kafka pod name
    KAFKA_POD=$(kubectl get pods -n $NAMESPACE -l app=kafka -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$KAFKA_POD" ]; then
        print_error "Kafka pod not found. Please ensure Kafka is deployed and running."
        return 1
    fi
    
    print_info "Using Kafka pod: $KAFKA_POD"
    
    # Wait a bit for Kafka to fully initialize
    sleep 5
    
    local created_count=0
    local failed_count=0
    
    for topic in "${KAFKA_TOPICS[@]}"; do
        echo -n "  Creating topic: $topic ... "
        
        if kubectl exec -n $NAMESPACE "$KAFKA_POD" -- kafka-topics.sh \
            --create \
            --topic "$topic" \
            --bootstrap-server localhost:9092 \
            --partitions 1 \
            --replication-factor 1 \
            --if-not-exists &>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            created_count=$((created_count + 1))
        else
            echo -e "${RED}✗${NC}"
            failed_count=$((failed_count + 1))
        fi
    done
    
    echo ""
    print_info "Topics created: $created_count, Failed: $failed_count"
    
    if [ $created_count -gt 0 ]; then
        print_info "Successfully created/verified $created_count topics"
    fi
}

# Function to list Kafka topics
list_kafka_topics() {
    print_step "Listing Kafka topics..."
    
    KAFKA_POD=$(kubectl get pods -n $NAMESPACE -l app=kafka -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$KAFKA_POD" ]; then
        print_error "Kafka pod not found"
        return 1
    fi
    
    kubectl exec -n $NAMESPACE "$KAFKA_POD" -- kafka-topics.sh \
        --list \
        --bootstrap-server localhost:9092
}

# Function to describe a specific topic
describe_kafka_topic() {
    read -p "Enter topic name: " topic_name
    
    if [ -z "$topic_name" ]; then
        print_error "Topic name cannot be empty"
        return 1
    fi
    
    KAFKA_POD=$(kubectl get pods -n $NAMESPACE -l app=kafka -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$KAFKA_POD" ]; then
        print_error "Kafka pod not found"
        return 1
    fi
    
    print_step "Describing topic: $topic_name"
    kubectl exec -n $NAMESPACE "$KAFKA_POD" -- kafka-topics.sh \
        --describe \
        --topic "$topic_name" \
        --bootstrap-server localhost:9092
}

# Function to delete all topics
delete_all_topics() {
    print_warn "This will delete ALL Kafka topics"
    read -p "Are you sure? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_info "Deletion cancelled"
        return 0
    fi
    
    KAFKA_POD=$(kubectl get pods -n $NAMESPACE -l app=kafka -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$KAFKA_POD" ]; then
        print_error "Kafka pod not found"
        return 1
    fi
    
    print_step "Deleting all topics..."
    
    for topic in "${KAFKA_TOPICS[@]}"; do
        echo -n "  Deleting topic: $topic ... "
        
        if kubectl exec -n $NAMESPACE "$KAFKA_POD" -- kafka-topics.sh \
            --delete \
            --topic "$topic" \
            --bootstrap-server localhost:9092 &>/dev/null; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${YELLOW}⊘${NC} (not found or already deleted)"
        fi
    done
    
    print_info "Topic deletion completed"
}

# Function to show deployment status
show_status() {
    echo ""
    print_info "=== Deployment Status ==="
    echo ""
    
    echo "Persistent Volumes & Claims:"
    kubectl get pv,pvc -n $NAMESPACE 2>/dev/null | grep kafka || echo "  No Kafka PV/PVC found"
    
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE 2>/dev/null | grep -E "NAME|kafka" || echo "  No Kafka pods found"
    
    echo ""
    echo "Services:"
    kubectl get svc -n $NAMESPACE 2>/dev/null | grep -E "NAME|kafka" || echo "  No Kafka services found"
    
    echo ""
}

# Function to get access information
show_access_info() {
    echo ""
    print_info "=== Access Information ==="
    echo ""
    
    print_info "Kafka Internal Access: kafka:9092"
    print_info "Kafka External Access: localhost:9094"
    
    if kubectl get deployment kafka-ui -n $NAMESPACE &> /dev/null; then
        NODEPORT=$(kubectl get svc kafka-ui -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
        if [ -n "$NODEPORT" ]; then
            print_info "Kafka UI: http://localhost:$NODEPORT"
        fi
    fi
    
    echo ""
}

# Function to delete Kafka resources
delete_kafka() {
    print_warn "This will delete all Kafka resources"
    read -p "Are you sure? (yes/no): " confirm
    
    if [[ "$confirm" == "yes" ]]; then
        print_step "Deleting Kafka UI..."
        kubectl delete -f "$KAFKA_UI_SRV_FILE" 2>/dev/null || print_warn "Kafka UI not found or already deleted"
        
        print_step "Deleting Kafka Service and Deployment..."
        kubectl delete -f "$KAFKA_SRV_FILE" 2>/dev/null || print_warn "Kafka service not found or already deleted"
        
        print_step "Deleting Kafka PV and PVC..."
        kubectl delete -f "$KAFKA_PERSISTENCE_FILE" 2>/dev/null || print_warn "Kafka persistence not found or already deleted"
        
        print_info "Kafka resources deleted successfully"
    else
        print_info "Deletion cancelled"
    fi
}

# Function to restart Kafka
restart_kafka() {
    print_step "Restarting Kafka..."
    kubectl rollout restart deployment/kafka -n $NAMESPACE
    kubectl rollout status deployment/kafka -n $NAMESPACE
    print_info "Kafka restarted successfully"
}

# Function to restart Kafka UI
restart_kafka_ui() {
    if kubectl get deployment kafka-ui -n $NAMESPACE &> /dev/null; then
        print_step "Restarting Kafka UI..."
        kubectl rollout restart deployment/kafka-ui -n $NAMESPACE
        kubectl rollout status deployment/kafka-ui -n $NAMESPACE
        print_info "Kafka UI restarted successfully"
    else
        print_warn "Kafka UI is not deployed"
    fi
}

# Function to view logs
view_logs() {
    echo ""
    echo "1. Kafka logs"
    echo "2. Kafka UI logs"
    read -p "Select service (1-2): " service_choice
    
    case $service_choice in
        1)
            POD=$(kubectl get pods -n $NAMESPACE -l app=kafka -o jsonpath='{.items[0].metadata.name}')
            if [ -n "$POD" ]; then
                print_info "Showing logs for Kafka pod: $POD"
                kubectl logs -f "$POD" -n $NAMESPACE
            else
                print_error "No Kafka pod found"
            fi
            ;;
        2)
            POD=$(kubectl get pods -n $NAMESPACE -l app=kafka-ui -o jsonpath='{.items[0].metadata.name}')
            if [ -n "$POD" ]; then
                print_info "Showing logs for Kafka UI pod: $POD"
                kubectl logs -f "$POD" -n $NAMESPACE
            else
                print_error "No Kafka UI pod found"
            fi
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Function to show menu
show_menu() {
    echo ""
    echo "======================================"
    echo "  Kafka Management Script"
    echo "======================================"
    echo ""
    echo "Deployment:"
    echo "  1. Deploy Kafka"
    echo "  2. Deploy Kafka UI"
    echo "  3. Deploy Both (Kafka + UI)"
    echo ""
    echo "Topic Management:"
    echo "  4. Create All Topics"
    echo "  5. List Topics"
    echo "  6. Describe Topic"
    echo "  7. Delete All Topics"
    echo ""
    echo "Maintenance:"
    echo "  8. Show Status"
    echo "  9. Restart Kafka"
    echo " 10. Restart Kafka UI"
    echo " 11. View Logs"
    echo ""
    echo "Cleanup:"
    echo " 12. Delete All Resources"
    echo " 13. Exit"
    echo ""
}

# Main function
main() {
    # Pre-flight checks
    check_kubectl
    check_manifest_files
    
    while true; do
        show_menu
        read -p "Select an option (1-13): " choice
        
        case $choice in
            1)
                deploy_kafka
                wait_for_kafka
                show_status
                show_access_info
                echo ""
                read -p "Do you want to create topics now? (y/n): " create_topics
                if [[ "$create_topics" == "y" || "$create_topics" == "Y" ]]; then
                    create_kafka_topics
                fi
                ;;
            2)
                deploy_kafka_ui
                wait_for_kafka_ui
                show_status
                show_access_info
                ;;
            3)
                deploy_kafka
                wait_for_kafka
                deploy_kafka_ui
                wait_for_kafka_ui
                show_status
                show_access_info
                echo ""
                read -p "Do you want to create topics now? (y/n): " create_topics
                if [[ "$create_topics" == "y" || "$create_topics" == "Y" ]]; then
                    create_kafka_topics
                fi
                ;;
            4)
                create_kafka_topics
                ;;
            5)
                list_kafka_topics
                ;;
            6)
                describe_kafka_topic
                ;;
            7)
                delete_all_topics
                ;;
            8)
                show_status
                show_access_info
                ;;
            9)
                restart_kafka
                ;;
            10)
                restart_kafka_ui
                ;;
            11)
                view_logs
                ;;
            12)
                delete_kafka
                ;;
            13)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please select 1-13"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main