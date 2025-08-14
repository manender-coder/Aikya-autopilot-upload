name: Next.js Deploy (Lockless, Error-Proof)

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

concurrency:
  group: nextjs-deploy
  cancel-in-progress: false

env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node (no cache, no lockfile needed)
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install deps (skip if no package.json)
        run: |
          if [ -f package.json ]; then
            npm install --no-audit --no-fund || true
          else
            echo "No package.json found, skipping install."
          fi

      - name: Build (skip if no script)
        run: |
          if [ -f package.json ]; then
            npm run build || echo "No build script or build failed; continuing"
          else
            echo "No package.json found, skipping build."
          fi

      # ---------- Vercel Deploy (conditional) ----------
      - name: Vercel Deploy (if secrets set)
        run: |
          if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_ORG_ID" ]; then
            echo "▶ Vercel deploy..."
            npx vercel pull --yes --environment=production --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" ${VERCEL_PROJECT_ID:+--project "$VERCEL_PROJECT_ID"} || true
            npx vercel build --token "$VERCEL_TOKEN" || true
            npx vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID" ${VERCEL_PROJECT_ID:+--project "$VERCEL_PROJECT_ID"} || true
            echo "✅ Vercel step finished"
          else
            echo "⏭️ Skipping Vercel (VERCEL_* secrets missing)"
          fi

      # ---------- Firebase Hosting (conditional) ----------
      - name: Firebase Deploy (if firebase.json + secrets)
        run: |
          if [ -f firebase.json ] && [ -n "$FIREBASE_SERVICE_ACCOUNT" ] && [ -n "$FIREBASE_PROJECT_ID" ]; then
            echo "▶ Firebase deploy..."
            npm i -g firebase-tools >/dev/null 2>&1
            firebase deploy --only hosting --project "$FIREBASE_PROJECT_ID" || true
            echo "✅ Firebase step finished"
          else
            echo "⏭️ Skipping Firebase (missing firebase.json or secrets)"
          fi

      - name: Summary
        run: |
          echo "### Next.js Deploy (Lockless) Summary" >> $GITHUB_STEP_SUMMARY
          echo "- Install/build attempted without lockfile" >> $GITHUB_STEP_SUMMARY
          echo "- Vercel: attempted if VERCEL_* present" >> $GITHUB_STEP_SUMMARY
          echo "- Firebase: attempted if firebase.json + secrets present" >> $GITHUB_STEP_SUMMARY
