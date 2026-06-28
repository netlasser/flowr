# FLOWR Beta Deployment Guide

This guide provides step-by-step instructions for deploying FLOWR to production environments.

## Prerequisites

1. Node.js 20+ and npm installed
2. PostgreSQL database (e.g., Supabase, Vercel Postgres, AWS RDS)
3. Vercel account (for frontend deployment)
4. Sentry account (for error tracking)
5. (Optional) Render or Railway account (for backend deployment)

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_APP_ENV`: Set to "beta" for beta deployment, "production" for full launch
- `DATABASE_URL`: PostgreSQL connection string
- `SENTRY_DSN`: Sentry DSN for error tracking
- `VITE_SENTRY_DSN`: Sentry DSN for frontend error tracking
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`: Sentry config for source maps

## Deployment Steps

### Option 1: Frontend on Vercel, Backend on Render

#### Frontend Deployment (Vercel)

1. Push your code to a GitHub/GitLab repository
2. Connect your repo to Vercel and import the project
3. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy!

#### Backend Deployment (Render)

1. Create a new "Web Service" on Render
2. Connect the same repository
3. Configure the settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables
5. Deploy!

### Option 2: Full-Stack on Vercel (Advanced)

You can deploy both frontend and backend on Vercel using serverless functions. See [Vercel docs](https://vercel.com/docs/functions) for more info.

## Database Migration

Run the migrations before first deployment:

```bash
# Create beta feedback table
psql $DATABASE_URL -f server/migrations/005_add_beta_feedback.sql
```

## Post-Deployment Checklist

- [ ] Verify all API endpoints work correctly
- [ ] Check Sentry for errors
- [ ] Test authentication flows
- [ ] Validate database connections
- [ ] Test beta feedback submission
- [ ] Confirm analytics are tracking correctly

## Beta Tester Access Control

To restrict access to beta testers:
1. Use the existing authentication system
2. Maintain a list of approved email addresses
3. Optionally, add an invite code system (future enhancement)

## Monitoring & Maintenance

- **Error Tracking**: Check Sentry daily for new issues
- **Performance Monitoring**: Review Sentry traces and performance metrics
- **Feedback Review**: Check beta feedback submissions regularly
- **Database Backups**: Ensure regular backups are configured
- **Log Monitoring**: Monitor server logs for issues

## Rollback Plan

If you need to roll back a deployment:

1. On Vercel: Go to the project dashboard and use "Revert to Previous Deployment"
2. On Render: Use the "Rollback" button in the deployments list
3. For database changes: Restore from a recent backup if needed

## Support

For issues during deployment:
1. Check the logs first
2. Review the error messages in Sentry
3. Contact the FLOWR team for assistance
