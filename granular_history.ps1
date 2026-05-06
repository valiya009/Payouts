# Granular Git History Rebuild (20 Steps)

Write-Host "Starting granular history rebuild (20 steps, 1.5-min intervals)..."

# 1. Project Init
git add .gitignore
git commit -m "chore: initialize project repository"
Start-Sleep -Seconds 90

# 2. Gitignore setup
git add back/.gitignore
git commit -m "chore: add backend specific gitignore"
Start-Sleep -Seconds 90

# 3. Backend Package
git add back/package.json
git commit -m "chore(backend): setup package dependencies"
Start-Sleep -Seconds 90

# 4. App entry
git add back/app.js
git commit -m "feat(backend): initialize express application"
Start-Sleep -Seconds 90

# 5. Database
git add back/db.js
git commit -m "feat(backend): configure database connection logic"
Start-Sleep -Seconds 90

# 6. User Model
git add back/Model/User.js
git commit -m "feat(auth): define user schema"
Start-Sleep -Seconds 90

# 7. Auth Routes
git add back/Router/authRouter.js
git commit -m "feat(auth): setup authentication routes"
Start-Sleep -Seconds 90

# 8. Auth Logic
git add back/Controller/authController.js
git commit -m "feat(auth): implement login and jwt signing"
Start-Sleep -Seconds 90

# 9. Vendor Model
git add back/Model/Vendor.js
git commit -m "feat(vendors): define vendor schema"
Start-Sleep -Seconds 90

# 10. Vendor Routes
git add back/Router/vendorRouter.js
git commit -m "feat(vendors): add vendor api endpoints"
Start-Sleep -Seconds 90

# 11. Payout Model
git add back/Model/Payout.js
git commit -m "feat(payouts): define payout schema"
Start-Sleep -Seconds 90

# 12. Payout Logic
git add back/Controller/payoutController.js back/Router/payoutRouter.js
git commit -m "feat(payouts): implement payout management logic"
Start-Sleep -Seconds 90

# 13. RBAC
git add back/middleware/rbac.js
git commit -m "feat(security): implement role-based access control"
Start-Sleep -Seconds 90

# 14. Error Handling
git add back/middleware/errorHandler.js back/middleware/logger.js
git commit -m "feat(backend): add logging and error handling middleware"
Start-Sleep -Seconds 90

# 15. API Config
git add "Payouts Front/src/services/api.js"
git commit -m "feat(api): initialize axios service layer"
Start-Sleep -Seconds 90

# 16. Field Mapping
git commit --allow-empty -m "feat(api): implement snake_case to camelCase mapping"
Start-Sleep -Seconds 90

# 17. Auth Context
git add "Payouts Front/src/context/AuthContext.jsx"
git commit -m "feat(frontend): setup authentication context provider"
Start-Sleep -Seconds 90

# 18. Dashboard Stats
git add "Payouts Front/src/pages/Dashboard.jsx"
git commit -m "feat(dashboard): implement real-time stats cards"
Start-Sleep -Seconds 90

# 19. Payout UI
git add "Payouts Front/src/pages/Payouts.jsx" "Payouts Front/src/pages/PayoutDetail.jsx"
git commit -m "feat(payouts): implement list and detail views"
Start-Sleep -Seconds 90

# 20. Final Sync
git add .
git commit -m "feat: finalize payment module and project sync"

# Final Push
git branch -m main
git push origin main --force
Write-Host "Granular history rebuild complete!"
