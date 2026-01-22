# MongoDB Replica Set Deployment

This folder contains Kubernetes manifests for deploying a MongoDB replica set with 3 replicas.

## Configuration

Before running the script, you can customize the storage path by editing the **top of the manage.sh file**:

```bash
# Edit these values in manage.sh
NAMESPACE="default"
REPLICA_COUNT=3
STORAGE_BASE_PATH="/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo"
```

## Quick Start

### Interactive Menu Mode (Recommended)

Simply run the script without arguments:

```bash
./manage.sh
```

You'll see an interactive menu:
```
======================================
  MongoDB Replica Set Manager
======================================

Deployment:
  1. Deploy MongoDB Replica Set
  2. Initialize Replica Set (Automatic)
  3. Show Manual Init Instructions

Monitoring:
  4. Show Status
  5. View Logs
  6. Test Connection

External Access (MongoDB Compass):
  7. Enable External Access (NodePort)
  8. Disable External Access
  9. Show Connection Info
 10. Port Forward (localhost)

Maintenance:
 11. Restart MongoDB Pods

Cleanup:
 12. Uninstall MongoDB
 13. Exit
```

### Command-Line Mode (Backward Compatible)

You can also use direct commands:

```bash
# Deploy MongoDB replica set
./manage.sh install

# Initialize replica set (automatic using Job)
./manage.sh init-replica

# Check status
./manage.sh status

# Enable external access for MongoDB Compass
./manage.sh enable-external

# Show connection information
./manage.sh connection-info

# Port forward to localhost
./manage.sh port-forward

# View logs
./manage.sh logs

# Test connection
./manage.sh test

# Uninstall
./manage.sh uninstall
```

## Available Commands

**Deployment:**
- **Deploy MongoDB** - Deploy StatefulSet, headless service, and create storage directories
- **Initialize Replica Set** - Initialize replica set using Kubernetes Job (automatic)
- **Manual Init Instructions** - Show manual initialization steps

**Monitoring:**
- **Show Status** - Display pods, services, PVs, PVCs, and replica set configuration
- **View Logs** - View logs from any MongoDB pod (interactive selection)
- **Test Connection** - Test MongoDB connection and verify replica set

**Maintenance:**
- **Restart MongoDB Pods** - Perform rolling restart of all MongoDB pods

**Cleanup:**
- **Uninstall** - Remove MongoDB replica set and all data (with confirmation)

## Connecting from MongoDB Compass

### Method 1: NodePort Service (Recommended for Kubernetes)

1. **Enable external access** from the menu or command:
   ```bash
   ./manage.sh enable-external
   ```

2. **Get connection information**:
   ```bash
   ./manage.sh connection-info
   ```

3. **Connect with MongoDB Compass**:
   - Open MongoDB Compass
   - **Important**: Use `directConnection=true` to prevent hostname resolution issues
   - Connection string: `mongodb://localhost:30017/?directConnection=true`
   - This connects directly to mongo-0 (primary)

   **Individual replica connections:**
   - mongo-0: `mongodb://localhost:30017/?directConnection=true`
   - mongo-1: `mongodb://localhost:30018/?directConnection=true`
   - mongo-2: `mongodb://localhost:30019/?directConnection=true`

   > **Note**: Without `directConnection=true`, MongoDB will try to resolve internal Kubernetes DNS names (mongo-0.mongo) which causes connection errors.

### Method 2: Port Forwarding (Alternative)

1. **Start port forward** from menu option 10 or:
   ```bash
   ./manage.sh port-forward
   ```

2. **Select a pod** to forward (or forward all)

3. **Connect with MongoDB Compass**:
   - Use connection string: `mongodb://localhost:27017/?directConnection=true` (for mongo-0)
   - Or `mongodb://localhost:27018/?directConnection=true` (for mongo-1)
   - Or `mongodb://localhost:27019/?directConnection=true` (for mongo-2)

> **Note**: Port forwarding requires keeping the terminal open. NodePort is more permanent but uses fixed ports (30017-30019). Always add `?directConnection=true` to prevent hostname resolution errors.

### Connection Strings Summary

**Internal (from within cluster):**
```
mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0
```

**External via NodePort (MongoDB Compass):**
```
mongodb://localhost:30017/?directConnection=true
```

**External via Port Forward (MongoDB Compass):**
```
mongodb://localhost:27017/?directConnection=true
```

> **Important**: The `?directConnection=true` parameter prevents MongoDB from trying to resolve internal Kubernetes DNS names.

## Architecture

The deployment consists of:
- **PersistentVolumes (3)** (optional): Pre-configured storage using hostPath for each replica
  - `mongo-pv-0` → `/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo/mongo-0`
  - `mongo-pv-1` → `/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo/mongo-1`
  - `mongo-pv-2` → `/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo/mongo-2`
- **StatefulSet**: 3 MongoDB replicas (mongo-0, mongo-1, mongo-2)
- **Headless Service**: DNS resolution for replica set members
- **PersistentVolumeClaims (3)**: Auto-created by StatefulSet (1Gi each)
**Internal (Kubernetes cluster):**
```
mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0
```

**External (MongoDB Compass - NodePort):**
```
mongodb://localhost:30017/
```

**External (MongoDB Compass - Port Forward):**
```
mongodb://localhost:27017/
  - `mongo-persistent-storage-mongo-2`
- **Initialization Job**: Automated replica set configuration

> **Note**: The StatefulSet uses `volumeClaimTemplates` which automatically creates one PVC per pod. The persistence file creates 3 matching PVs for these PVCs to bind to. If the persistence file doesn't exist, Kubernetes will use dynamic provisioning.

## Replica Set Initialization

### Automatic (Recommended)

After deploying with `./manage.sh install`, run:

```bash
./manage.sh init-replica
```

This uses a Kubernetes Job that:
1. Waits for all MongoDB pods to be ready
2. Connects to mongo-0
3. Initializes the replica set with all members
4. Verifies the configuration

> **Note**: The job only works if mongo-0 is available. After initialization, MongoDB will use its self-leader election mechanism.

### Manual Approach

If you prefer manual initialization:

1. Get inside the mongo-0 pod:
```bash
kubectl exec -it mongo-0 -- bash
```

2. Open MongoDB shell and configure replica set:
```bash
mongosh

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-0.mongo:27017" },
    { _id: 1, host: "mongo-1.mongo:27017" },
    { _id: 2, host: "mongo-2.mongo:27017" }
  ]
})
```

3. Verify the replica set:
```bash
rs.status()
```

## Connection String

Use this connection string from your applications:

```
mongodb://mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/?replicaSet=rs0
```

## Troubleshooting

### Check Pod Status
```bash
./manage.sh status
```

### View Logs
```bash
./manage.sh logs mongo-0
./manage.sh logs mongo-1
./manage.sh logs mongo-2
```

### Replica Set Not Initializing
If the initialization job fails:
1. Check logs: `kubectl logs job/mongo-init -c mongo-init`
2. Ensure all 3 pods are running
3. Try manual initialization: `./manage.sh manual-init`

### Rolling Restart
If pods are in a bad state:
```bash
./manage.sh restart
```

### MongoDB Compass Connection Error: "getaddrinfo ENOTFOUND mongo-0.mongo"

**Problem**: MongoDB Compass tries to resolve internal Kubernetes DNS names.

**Solution**: Add `?directConnection=true` to your connection string:
```
mongodb://localhost:30017/?directConnection=true
```

**Why this happens**: 
- The replica set is configured with internal hostnames (mongo-0.mongo, mongo-1.mongo, etc.)
- When you connect without `directConnection=true`, MongoDB returns these hostnames to the client
- Compass tries to connect to these internal names, which don't resolve outside Kubernetes

**Alternative Solution** (if you need full replica set features):
Add entries to your `/etc/hosts` file:
```bash
127.0.0.1 mongo-0.mongo
127.0.0.1 mongo-1.mongo
127.0.0.1 mongo-2.mongo
```
Then use: `mongodb://localhost:30017,localhost:30018,localhost:30019/?replicaSet=rs0`

## Files

- `0-mongo-peristance.yaml` - 3 PersistentVolumes for hostPath storage (one per replica)
- `02-service-headless.yaml` - Headless service for StatefulSet DNS
- `03-service-nodeport.yaml` - NodePort services for external access (optional)
- `04-statefulset.yaml` - MongoDB StatefulSet with 3 replicas and volumeClaimTemplates
- `05-job(runWhenRequired).yaml` - Initialization job for replica set
- `manage.sh` - Management script for all operations

## Important Notes

### Storage Path Configuration
- The storage base path is configurable at the top of `manage.sh`
- Default: `/home/abhiram/Bootcamp/week-23-to-27/humane/backend/data/mongo`
- The script automatically creates subdirectories: `mongo-0`, `mongo-1`, `mongo-2`
- Make sure the parent directory is writable before deployment

### Volume Management
- **StatefulSets automatically create one PVC per pod** using `volumeClaimTemplates`
- Each PVC is named: `<volumeClaimTemplate-name>-<statefulset-name>-<ordinal>`
- In this setup: `mongo-persistent-storage-mongo-0`, `mongo-persistent-storage-mongo-1`, `mongo-persistent-storage-mongo-2`
- The persistence file creates 3 PVs that will bind to these auto-created PVCs
- The manage.sh script automatically creates the necessary hostPath directories

### Interactive vs Command-Line Mode
- **No arguments**: Interactive menu mode (user-friendly, guided)
- **With arguments**: Command-line mode (automation, scripting)
- Both modes support the same operations

### External Access Options
1. **NodePort Service** - Exposes MongoDB on ports 30017-30019 (persistent, survives restarts)
2. **Port Forwarding** - Temporary forwarding to localhost (requires terminal to stay open)
3. NodePort is recommended for regular development work
4. Port forwarding is useful for quick testing or when NodePort ports are unavailable

### Security Note
- External access exposes MongoDB without authentication by default
- For production, always enable authentication and use proper network policies
- Consider using port-forward for development instead of NodePort in shared environments

