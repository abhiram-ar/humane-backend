## Prerequisite

1. Install the Gateway API CRDs before installing Kong Ingress Controller.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
```

2. Create a Gateway and GatewayClass instance to use. (in the current path look for `APIGateway.yaml`)
   > node: The Gateway must be in the same namespace as the Kong deployment (here we used namespace kong)

```bash
kubectl apply -n kong -f ./APIGateway.yaml
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

Ensure that your services and routes are properly defined before enabling authentication and other plugins. Kong supports both classic and modern Kubernetes APIs for managing these:

-  **Ingress API** – Uses standard Kubernetes Ingress objects along with Kong CRDs (e.g., `KongPlugin`, `KongIngress`).
-  **Gateway API** – A newer Kubernetes standard, using `GatewayClass`, `Gateway`, `HTTPRoute`, `ReferenceGrant`, and related resources.

> we have used gateway API in the `k8s/4-networking`

## 3. Request Authorization – JWT

To secure your APIs, we use JWT (JSON Web Token) authentication for request authorization. Follow these steps:

### 1. Configure the JWT Secret

Define your JWT secret in `jwtsecret.yaml`.
This file contains the JWT access token secret that will be used to validate tokens.

> **Important:** Ensure that the secret is properly managed and updated for production environments.

```bash
kubectl apply -f jwtsecret.yaml
```

### 2. Deploy the Kong Request Consumer

Deploy the consumer that will use the JWT plugin for authentication.

-  A **consumer** can represent either a **microservice** or a **frontend client**.
-  In this setup, we are using a **frontend client as the consumer**.

Instead of attaching the plugin configuration directly to a service or route, create a `KongPlugin` resource for JWT authentication and annotate the respective Kubernetes resource with:

```
konghq.com/plugins: <jwt-plugin-name>
```

### 3. Annotate Routes for JWT Verification

Locate the route definitions in `infra/k8s/4-networking` and annotate the routes that require JWT authentication.

This ensures that only requests with valid JWT tokens can access those routes.

## 4. Rate Limiting

To prevent abuse and ensure fair usage of APIs, we implement rate limiting using Kong’s built-in capabilities.

1. **Create a `KongPlugin` resource** defining the desired rate-limiting configuration.
2. **Apply the plugin manifest**:
   ```bash
   kubectl apply -f ./RatelimitingPlugin.yaml
   ```
3. **Annotate the target route or resource** with the `konghq.com/plugins` annotation to bind the rate-limiting plugin.

> This ensures that incoming requests are throttled based on the configured limits (e.g., requests per second/minute), protecting backend services from overuse or denial-of-service attacks.
