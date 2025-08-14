## Responsibility

This service moderates media content on the Humane platform by:

-  Consuming media creation events
-  Processing content through moderation pipelines
-  Emitting moderation result events

<br>

> note: we are not moderating chat media as these are private and its not appropriate to read it

## ML Evaluations

This service uses machine learning models for content moderation.
For detailed information about the ML evaluation processes, benchmarks, and results, please refer to the [ML-evals README](./ML-evals/README.md).

### Premilinary analysis of `inception_v3`

-  the model seems to be very sensitive to explicit content
-  any form of glamour has high probability(>90%) being in `Porn` class
-  bollywood video song frames are flagged in NSFW class
-  Male Body astetics like body builers are not flagged as explicit which is good
