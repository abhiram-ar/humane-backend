# humane-backend

starting dev cluster

```bash
skaffold dev
```

Exposing a mongoDB container port to inspect via mongoDB compass

```bash
kubectl port-forward svc/user-mongo-srv 27017:27017
```

postgres
```bash
kubectl port-forward svc/user-postgres-srv 5432:5432
```

elasticsearhc
```bash
kubectl port-forward service/elasticsearch 9200:9200
```

production change

-  kafka ui nodePort need to be closed
-  convert kafka srv to stateful set
- query service ingress rotues, close off internal routes

## doubts

-  where to keep the instace config files - like for s3 and kafka


## learning
- clean/delte the pv/pvc when changing the version of pods in services to avoid conflit
