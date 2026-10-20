# Current inspection workflow updates
- [x] Add timestamped local drafts with all inspection fields and evidence, resume/delete dialog, and green save confirmation; 19 tests passed and browser verified cross-refresh photo/text restoration plus deletion cancel/confirm.
- [x] Persist editable Active Project and Assessor; include names in reports.
- [x] Add confirmed logout that clears session state; cancel and confirm verified in the app.
- [x] Add matching registration password fields with eye toggles; validation verified, existing mock sign-in unchanged, no password storage.
- [x] Enable unsafe camera/gallery attachments with preview and remove/replace; upload/removal verified, evidence retained in memory until refresh.
- [x] Clean methodology wording; app flows verified and 14 tests passed.

# Camera analysis
- [x] Add protected direct-Google photo analysis and structured results.
- [x] Connect camera with labeled simulated fallback; six tests and signed-out upload/reset passed.
- [x] Deploy function and verify unauthenticated requests return 401; Google key saved securely.
- [ ] Confirm a live Google photo response: model chain + one retry deployed; Google currently answers every model this key can use with 503 "high demand", so results still come from labeled simulated examples. Blocker: provider capacity on the owner's key.
# Styling refinements
- [x] Restore cyan dashboard helmet; preserve login Wi-Fi.
- [x] Restore emerald verified checklist and pass states.
- [x] Restore calm cyan/emerald ESG palette.
- [x] Check updated checklist and ESG screens in the preview; green verified states, cyan helmet, unchanged login Wi-Fi, no ESG overflow or runtime errors; 11 camera tests passed.
- [x] Metric dials: SAFETY / ESG / OPS RISK labels electric blue #00A3E0; shield blue, ESG leaf emerald #10B981, Ops Risk pulse icon and dial ring stay red.
- [x] Live Environment: rain cloud white with #00A3E0 rain streaks (Rain mm + Water Potential), humidity droplets #00A3E0; verified computed colors in the preview.
