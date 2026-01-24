
### 1. Deploy K3s
```bash
curl -sfL https://get.k3s.io | sh - 
# Check for Ready node, takes ~30 seconds 
sudo k3s kubectl get node 
```

### 2. Path for kubeconfig - this is required for native kubeclt, k9s and helm operations

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

### 3. kuebctl permission fix 

```bash
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
```
> note: we will be required to run this  each time k3s restart


### 4. install helm

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
chmod 700 get_helm.sh
./get_helm.sh
```

### 5. remove terifik gateway 
> since we are using kong-ingress-controller gateway API, terifik will interfeat with the loadbalcer allocation of kong, so its better to remove terifik

reference - [Link](https://qdnqn.com/k3s-remove-traefik/)

```bash
sudo rm -rf /var/lib/rancher/k3s/server/manifests/traefik.yaml
helm uninstall traefik traefik-crd -n kube-system
sudo systemctl restart k3s
```

### 6. install k9s
```bash
curl -sS https://webi.sh/k9s | sh; \
source ~/.config/envman/PATH.env
```

### 7. install skaffold 

```bash
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
sudo install skaffold /usr/local/bin/
```



mongodb+srv://abhiram:Abhi%40123@humane-prod-cluster.u2lj1nd.mongodb.net/

mongodb+srv://abhiram:Abhi%40123@humane-prod-cluster.u2lj1nd.mongodb.net/?appName=humane-prod-cluster

mongodb+srv://abhiram:gbCv56DNV0oy2lKs@cluster0.th4j6.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0



mongodb+srv://abhiram:Abhi%40123@humane-prod-cluster.mongodb.net/notification?retryWrites=true&w=majority&appName=notification-service-prod
