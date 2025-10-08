### Port Forwarding (For Local Inspection)

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
