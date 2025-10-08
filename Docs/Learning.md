## learning

-  clean/delte the pv/pvc when changing the version of pods in services to avoid conflit
-  kafka offset are exclusive. Meaning if we commit the current offset, it tells kafka consumers should read next doc from currently commited offset. So when commiting, commit at offset+1
-  Mutex locks and Buffer rotation for counter aggregation

choices;

-  why not moderating comments? Good commets are rewarded so people are forces to put good comments