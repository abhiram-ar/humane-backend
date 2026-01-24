### 1. Install operator

before apply `rabbitMQ.yaml`, make sure the rabbitMQ cluster operator is installed in the cluster
[Ref](https://www.rabbitmq.com/kubernetes/operator/install-operator)

OR Quick install - but make sure to check the above link if installation fails
```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

### Create a new rabbimq instance

apply `rabbitmq.yaml`

### Credentials

get the new credential by running the `../scripts/rabbitmq.credentials.sh`

User this credential in the rabbit mq connection string


### Common issuse
- deployemnt error/stuck because dynamic PV cannot be provisioned. `./rabbiqMQ.yaml` specify the storage class as `hostpath` which only works for docker like kuberneies environment. To fix change the storageClass to the what the k8s environment provides by running `kubectl get storageclass`. for k3s use `local-path`

- rabbitmq operator uses helm to deploy the manifest. make sure helm is able to access k8s and k8s config