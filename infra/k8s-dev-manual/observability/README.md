### 0. Create a monitoring namespace

```bash
kubectl create namespace monitoring
```

### 1. Add the grafana helm repo

```bash
helm repo add grafana https://grafana.github.io/helm-charts
```

Update the helm repo

```bash
helm repo update
```

### 2. Deploy Loki using the configuration file values.yaml:

> note: pwd should be `k8s-dev-manual/observability/1-loki/`, or give relative path for loki's value.yaml file

> productionChange: the storage class is configured to be `hostpath` for development
> Change it to appropriate cloud `storgeClass` in production or `null` for use default `storageClass`

```bash
helm install loki grafana/loki --namespace monitoring -f values.yaml

# or more specific

helm install loki grafana/loki --namespace monitoring --version 6.37.0 --values k8s-dev-manual/observability/2-loki/values.yaml
```

> [all configurable chart values]("https://github.com/grafana/loki/blob/main/production/helm/loki/values.yaml")

### 3. Add prometheus-community helm repo

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

### 4. Install kube promethes stak

This,

1. deployes prometheus
2. deployes grafana and add prometheus as default datasouce
3. Configures already deployed loki as another datasource

```bash
helm install kpstack prometheus-community/kube-prometheus-stack --version 77.0.2 --namespace monitoring --values {change: relative path}/values.yaml
```

> [all configurable chart values]("https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml")

### 5. Selecting microservices to scap metrics

-  Annotating a service to scrap only works for instace deployment of prometeus, because we are using kube-prometesu stack which uses prometheus operator to deploy prometheus
-  We either need to use `serviceMonitor` or `podMonitor` to configure targets for prometheus

deploy `k8s-dev-manual/observability/scrap.serviceMonitor.yaml`

-  Make sure each serviceMonitor has label release : {Helm kube prometheus release name}
-  make usre the services need to be monitored have /metrics endpoint
-  has label `monitor: "true"`
-  the port name of the service is same as that mentioned in serviceMonitor (web)
