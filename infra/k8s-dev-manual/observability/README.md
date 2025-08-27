### 0. Create a monitoring namespace

```bash
kubectl create namespace monitoring
```

### 1. Install the grafana helm repo

```bash
helm repo add grafana https://grafana.github.io/helm-charts
```

Update the helm repo

```bash
helm repo update
```

### 2. Deploy/Install-chat Loki using the configuration file values.yaml:

> note: pwd should be `k8s-dev-manual/observability/1-loki/`, or give relative path for loki's value.yaml file

> productionChange: the storage class is configured to be `hostpath` for development
> Change it to appropriate cloud `storgeClass` in production or `null` for use default `storageClass`

```bash
helm install loki grafana/loki --namespace monitoring -f values.yaml

# or

helm install loki grafana/loki --namespace monitoring --version 6.37.0 --values k8s-dev-manual/observability/2-loki/values.yaml
```

> [all configurable chart values]("https://github.com/grafana/loki/blob/main/production/helm/loki/values.yaml")
