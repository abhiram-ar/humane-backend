### 1. Install operator

before apply `rabbitMQ.yaml`, make sure the rabbitMQ cluster operator is installed in the cluster
[Ref](https://www.rabbitmq.com/kubernetes/operator/install-operator)

OR Quick install - but make sure to check the above link if installation fails
```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

### Create a new rabbiqm instance

apply `rabbitmq.yaml`

### Credentials

get the new credential by running the `../scripts/rabbitmq.credentials.sh`

User this credential in the rabbit mq connection string
