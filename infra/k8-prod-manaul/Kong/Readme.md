kong request for LB but microK8s dont have an LB

-  we manullay enable the loadbalancer provdided by micorK8
-  enable hostpath and dns

the Ip range of the inbuild londbalancer of microk8s should be x:x where x is the public ip of ec2

Kubectl should be available at the root level without micork8s kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
microk8s config > ~/.kube/config

kubectl get nodes # check
```
