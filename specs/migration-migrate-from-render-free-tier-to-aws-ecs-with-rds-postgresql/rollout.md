# Rollout Plan

## Phase 1: Infrastructure (Day 1)
- terraform apply
- Verify VPC, subnets, ALB, ECS cluster, RDS created

## Phase 2: Data Migration (Day 1)
- pg_dump from Render
- pg_restore to RDS
- Verify all 14 tables + row counts match

## Phase 3: Deploy + Parallel Run (Day 2)
- Push Docker image to ECR
- Deploy ECS service
- Test all endpoints on AWS URL
- Run both Render and AWS simultaneously

## Phase 4: Switch (Day 3)
- Update frontend to AWS URL
- Monitor closely for 4 hours

## Phase 5: Stabilize (Day 3-5)
- Monitor CloudWatch for 48 hours
- Shut down Render only after 48h stable

## Post-Deploy Checks
- [ ] /api/health returns 200
- [ ] /api/residents/stats shows 500 residents
- [ ] WebSocket /ws/notifications connects
- [ ] Agent routing works (5/5 intents)
- [ ] Admin Panel loads with real data
- [ ] OTP verification works
- [ ] No errors in CloudWatch
