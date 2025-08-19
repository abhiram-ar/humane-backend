> Run the job.yaml for the replicaset consifguration on the first monogInitialization/
> After that monogo will have self leader election mechnishm and the job only works if mongo-0 is the leader

### OR manual approch

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
