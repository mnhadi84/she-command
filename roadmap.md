# Camera analysis
- [x] Add protected direct-Google photo analysis and structured results.
- [x] Connect camera with labeled simulated fallback; six tests and signed-out upload/reset passed.
- [x] Deploy function and verify unauthenticated requests return 401; Google key saved securely.
- [ ] Confirm a live Google photo response: model chain + one retry deployed; Google currently answers every model this key can use with 503 "high demand", so results still come from labeled simulated examples. Blocker: provider capacity on the owner's key.