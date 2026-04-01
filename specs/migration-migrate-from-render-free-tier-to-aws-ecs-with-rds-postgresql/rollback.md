# Rollback Plan

## Rollback Conditions
- AWS health check fails for > 5 minutes
- Database migration has data loss
- WebSocket notifications stop working
- Response time > 5 seconds consistently

## Rollback Steps
1. Revert VITE_API_URL in Vercel to Render URL
2. Redeploy Vercel frontend
3. Verify Render is still running (don't shut it down until 48h stable)
4. Investigate AWS issues

## Post-Rollback Verification
- Frontend loads and connects to Render backend
- All agent routing works
- Admin Panel shows correct data
- No data loss in Render DB
