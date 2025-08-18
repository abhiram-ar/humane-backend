## Prerequisite

1. Install the Gateway API CRDs before installing Kong Ingress Controller.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
```

2. Create a Gateway and GatewayClass instance to use. (in the current path look for `APIGateway.yaml`)

```bash
kubectl apply -f ./APIGateway.yaml
```

3. Helm must be installed on system
   [Install page](https://helm.sh/docs/intro/install/)

## 1. Install Kong Ingress Controller

```bash
helm repo add kong https://charts.konghq.com
helm repo update

```

The default values file installs Kong Ingress Controller in Gateway Discovery mode with a DB-less Kong Gateway. This is the recommended deployment topology.

Run the following command to install Kong Ingress Controller:

```bash
helm install kong kong/ingress -n kong --create-namespace
```

## 2. Services and Routes

### Have your services ready

Kong Ingress Controller (KIC) actually supports two APIs right now:

1. Ingress API (the classic Kubernetes Ingress objects, plus Kong CRDs like KongPlugin, KongIngress).
2. Gateway API (the newer Kubernetes standard: GatewayClass, Gateway, HTTPRoute, ReferenceGrant, etc.).

## 3. Rate limiting

Configuring plugins with Kong Ingress Controller is different compared to how you’d do it with Kong Gateway. Rather than attaching a configuration directly to a service or route, you create a `KongPlugin` definition and then annotate your Kubernetes resource with the konghq.com/plugins annotation.
Apply the `./RatelimitingPlugin.yaml`

## 4. Proxy caching

In the previous section used created a KongPlugin that was applied to a specific service or route. You can also use a `KongClusterPlugin` which is a global plugin that applies to all services.