## Responsibility

This service moderates media content on the Humane platform by:

-  Consuming media creation events
-  Processing content through moderation pipelines
-  Emitting moderation result events

> note: we are not moderating chat media as these are private and its not appropriate to read it

## ML Evaluations

This service uses machine learning models for content moderation.
For detailed information about the ML evaluation processes, benchmarks, and results, please refer to the [ML-evals README](./ML-evals/README.md).

### Premilinary analysis of `inception_v3`

-  the model seems to be very sensitive to explicit content
-  any form of glamour has high probability(>90%) being in `Porn` class
-  bollywood video song frames are flagged in NSFW class
-  Male Body astetics like body builers are not flagged as explicit which is good

## Notes

### How video is flagged as explicit?

1. **Frame extraction**: We extract 1 frame per second rather than processing the entire 30fps video to avoid redundancy and reduce processing time. Each frame is saved as a JPG.
2. **Classification**: Each extracted frame is evaluated through the `inception_v3` NSFW classification model.
3. **Filtering**: We only consider frames with NSFW class probability greater than `ENV.MEDIA_CONTENT_FLAG_THRESHOLD`.
4. **Flagging**: To account for false positives, videos are only flagged as explicit if they contain 10+ frames above the threshold value.

> **Edge Case**: For videos shorter than 10 seconds, we also consider the percentage of explicit frames (>2% of total frames).
