# humane-backend

starting dev cluster
```bash
skaffold dev
```

Exposing a mongoDB container port to inspect via mongoDB compass
```bash
kubectl port-forward svc/user-mongo-srv 27017:27017
```

