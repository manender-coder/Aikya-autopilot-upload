Aikya One-Click Autopilot Pack

How to install (web UI):
1) Download this zip and unzip.
2) Upload `.github/workflows/autopilot-deploy.yml` to your repo at the same path.
3) (Optional) Upload `scripts/captions_autonorm.sh`.
4) Add/verify Secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT or FIREBASE_TOKEN, FIREBASE_PROJECT_ID.
5) Go to Actions → run workflow → check Preflight + Wrap-up.
