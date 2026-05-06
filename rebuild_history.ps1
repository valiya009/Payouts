# Rebuild Git History Script

Write-Host "Starting history rebuild..."

# 1. Setup base structure
git add .gitignore back/.gitignore
git commit -m "chore: setup project structure and gitignores"
Write-Host "Step 1 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 2. Auth & Route Fixes
git add back/app.js back/Router/payoutRouter.js back/Controller/authController.js
git commit -m "feat(auth): fix login response and api route mounting"
Write-Host "Step 2 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 3. API Service Layer
git add "Payouts Front/src/services/api.js"
git commit -m "feat(api): implement snake_case to camelCase field mapping"
Write-Host "Step 3 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 4. Vendor Management
git add back/Controller/vendorController.js "Payouts Front/src/pages/Vendors.jsx"
git commit -m "feat(vendors): implement backend-side vendor searching"
Write-Host "Step 4 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 5. Payout Filtering & Pagination
git add back/Controller/payoutController.js "Payouts Front/src/pages/Payouts.jsx"
git commit -m "feat(payouts): implement backend filtering and pagination"
Write-Host "Step 5 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 6. Payout Detail & Actions
git add "Payouts Front/src/pages/PayoutDetail.jsx"
git commit -m "feat(payouts): update detail view and audit trail"
Write-Host "Step 6 committed. Waiting 1 minute..."
Start-Sleep -Seconds 60

# 7. Dashboard Enhancement
git add "Payouts Front/src/pages/Dashboard.jsx"
git commit -m "feat(dashboard): implement dynamic stats and recent activity"
Write-Host "Step 7 committed."

# 8. Final Push
git branch -m main
git push origin main --force
Write-Host "History rebuild complete and pushed to GitHub!"
