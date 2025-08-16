username="$(kubectl get secret humane-rabbitmq-default-user -o jsonpath='{.data.username}' | base64 --decode)"
echo "username: $username"
password="$(kubectl get secret humane-rabbitmq-default-user -o jsonpath='{.data.password}' | base64 --decode)"
echo "password: $password"
service="$(kubectl get service humane-rabbitmq -o jsonpath='{.spec.clusterIP}')"
echo "service: $service"

# uri= amqp://$username:$password@$service