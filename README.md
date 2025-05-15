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

production change

-  kafka ui nodePort need to be closed
-  convert kafka srv to stateful set

## doubts

-  where to keep the instace config files - like for s3 and kafka
