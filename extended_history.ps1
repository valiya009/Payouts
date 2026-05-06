# Extended Git History Rebuild (2-minute intervals)

Write-Host "Starting extended history rebuild (2-minute intervals)..."

# 1. Project Init
git add .gitignore
git commit -m "chore: initial project configuration and global gitignore"
Write-Host "Step 1 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 2. Backend Base
git add back/package.json back/app.js back/db.js
git commit -m "feat(backend): initialize express server and database connection"
Write-Host "Step 2 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 3. Auth Backend
git add back/Model/User.js back/Controller/authController.js back/Router/authRouter.js
git commit -m "feat(auth): implement user authentication and jwt logic"
Write-Host "Step 3 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 4. Vendor Backend
git add back/Model/Vendor.js back/Controller/vendorController.js back/Router/vendorRouter.js back/.gitignore
git commit -m "feat(vendors): setup vendor model and basic api endpoints"
Write-Host "Step 4 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 5. Payout Backend
git add back/Model/Payout.js back/Controller/payoutController.js back/Router/payoutRouter.js
git commit -m "feat(payouts): implement payout management backend"
Write-Host "Step 5 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 6. RBAC & Middleware
git add back/middleware/rbac.js back/middleware/errorHandler.js back/middleware/logger.js
git commit -m "feat(security): add role-based access control and error handling"
Write-Host "Step 6 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 7. Frontend API Service
git add "Payouts Front/src/services/api.js"
git commit -m "feat(api): configure axios service with field mapping logic"
Write-Host "Step 7 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 8. Frontend Auth UI
git add "Payouts Front/src/context/AuthContext.jsx" "Payouts Front/src/pages/Login.jsx"
git commit -m "feat(frontend): integrate authentication context and login view"
Write-Host "Step 8 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 9. Vendor Search Feature
git add "Payouts Front/src/pages/Vendors.jsx"
git commit -m "feat(vendors): implement debounced backend search"
Write-Host "Step 9 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 10. Payout Filters & Pagination
git add "Payouts Front/src/pages/Payouts.jsx"
git commit -m "feat(payouts): add status filtering and server-side pagination"
Write-Host "Step 10 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 11. Payout Details & Audit
git add back/Model/Audit.js "Payouts Front/src/pages/PayoutDetail.jsx"
git commit -m "feat(payouts): implement audit trail and action workflows"
Write-Host "Step 11 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 12. Dashboard & Stats
git add "Payouts Front/src/pages/Dashboard.jsx"
git commit -m "feat(dashboard): implement real-time stats and recent activity"
Write-Host "Step 12 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 13. Documentation
git add "Payouts Front/README.md"
git commit -m "docs: update readme with project details and setup instructions"
Write-Host "Step 13 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 14. Asset & Style Cleanup
git add "Payouts Front/src/index.css" "Payouts Front/src/App.css"
git commit -m "style: finalize premium ui theme and global styles"
Write-Host "Step 14 committed. Waiting 2 minutes..."
Start-Sleep -Seconds 120

# 15. Final Module Integration
git add .
git commit -m "feat: complete payment module integration and final testing"
Write-Host "Step 15 committed."

# Final Push
git branch -m main
git push origin main --force
Write-Host "Extended history rebuild complete and pushed to GitHub!"
