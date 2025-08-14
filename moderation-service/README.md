# Humane Moderation service

## Responsibility

This service moderates media content on the Humane platform by:
- Consuming media creation events
- Processing content through moderation pipelines
- Emitting moderation result events

<br>

> note: we are not moderating chat media as these are private and its not appropriate to read it

## ML Evaluations

This service uses machine learning models for content moderation.
For detailed information about the ML evaluation processes, benchmarks, and results, please refer to the [ML-evals README](./ML-evals/README.md).
