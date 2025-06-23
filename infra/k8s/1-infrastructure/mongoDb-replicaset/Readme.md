after all pod has started

-  get inside the mongo-0 and congigure replicaset

```bash
kubectl exec -it mongo-0 -- bash
```

after getting inside pod, load the monogo shell and enter

```bash
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-0.mongo:27017" },
    { _id: 1, host: "mongo-1.mongo:27017" },
    { _id: 2, host: "mongo-2.mongo:27017" }
  ]
})
```
