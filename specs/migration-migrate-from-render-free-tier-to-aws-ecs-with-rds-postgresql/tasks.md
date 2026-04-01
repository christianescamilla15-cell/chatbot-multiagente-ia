# Tasks - AWS Migration

## T1: Create Terraform infrastructure
- Description: VPC, subnets, ALB, ECS cluster, RDS, security groups, IAM roles
- Owner Agent: Deployment Agent
- Dependencies: none
- Deliverables: infra/terraform/*.tf
- Validation: terraform plan succeeds
- Risk: medium

## T2: Create ECS task definition + Dockerfile
- Description: Update Dockerfile for ECS, create task definition with env vars, health check
- Owner Agent: Deployment Agent
- Dependencies: T1
- Deliverables: Dockerfile updated, infra/ecs-task-def.json
- Validation: docker build succeeds, health check passes
- Risk: low

## T3: Migrate database
- Description: pg_dump from Render, pg_restore to RDS. Verify all 14 tables + data
- Owner Agent: Developer Agent
- Dependencies: T1 (RDS must exist)
- Deliverables: migration script, verification queries
- Validation: SELECT COUNT(*) matches on all tables
- Risk: high

## T4: Deploy to ECS
- Description: Push Docker image to ECR, deploy ECS service, verify health
- Owner Agent: Deployment Agent
- Dependencies: T2, T3
- Deliverables: ECS service running, ALB routing to it
- Validation: /api/health returns 200, /api/residents/stats returns 500 residents
- Risk: medium

## T5: Parallel run
- Description: Both Render and AWS running. Test all endpoints on AWS URL
- Owner Agent: Test Agent
- Dependencies: T4
- Deliverables: test report comparing Render vs AWS responses
- Validation: all 5 routing tests pass on AWS, WebSocket works
- Risk: low

## T6: Switch frontend
- Description: Update VITE_API_URL in Vercel to point to AWS ALB
- Owner Agent: Deployment Agent
- Dependencies: T5
- Deliverables: Vercel env var updated, redeploy
- Validation: frontend works with AWS backend
- Risk: low

## T7: Monitor + shutdown Render
- Description: Monitor AWS for 48h. If stable, shut down Render service
- Owner Agent: Reviewer Agent
- Dependencies: T6
- Deliverables: monitoring checklist, Render shutdown
- Validation: no errors in CloudWatch for 48h
- Risk: low
