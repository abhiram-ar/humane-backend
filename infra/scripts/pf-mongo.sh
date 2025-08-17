# kubectl port-forward svc/mongo-srv 27017:27017
kubectl port-forward pod/mongo-0 27017:27017 # only the primary in replicaset