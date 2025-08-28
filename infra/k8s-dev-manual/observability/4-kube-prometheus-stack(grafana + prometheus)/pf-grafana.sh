export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=kpstack" -oname)
kubectl --namespace monitoring port-forward $POD_NAME 3000