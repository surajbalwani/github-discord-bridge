# GitHub-Discord Bridge: Project Planning

## Overview
A web-based mini-project that allows users to authenticate with GitHub and Discord, and set up custom rules to route GitHub events (commits, PRs, etc.) to specific Discord servers and channels.

## Goals
- Connect GitHub and Discord via OAuth.
- UI to map GitHub repository events to Discord channels with advanced filtering.
- Completely free to host (infrastructure and database).

## Architecture & Infrastructure (Decided)
- **Framework**: Next.js (App Router) for both Frontend UI and Backend API routes.
- **Hosting**: Vercel (Free Tier).
- **Database**: Supabase (PostgreSQL) (Free Tier). Provides robust relational data storage and can easily handle OAuth sessions.
- **GitHub Integration**: 
  - OAuth App for authentication (Scope: `repo` to access personal and org repositories).
  - Programmatic Webhook creation on selected repositories.
- **Discord Integration**:
  - OAuth2 for authentication.
  - Using **Discord Webhooks** for message delivery (simpler execution, no persistent bot presence required for sending).
  - *Implementation detail*: We will likely use a bot token under the hood to fetch the user's servers/channels and dynamically create webhooks in the selected channels.

## Features & Scope
1. **Authentication Flow**:
   - "Login with GitHub"
   - "Connect Discord"
2. **Dashboard**:
   - List connected GitHub repositories (Personal & Organization).
   - List available Discord servers and channels the user manages.
   - Interface to create "Triggers" (Rules).
3. **Advanced Filtering**:
   - Users can filter triggers (e.g., only trigger on pushes to the `main` branch, or PRs with a `bug` label).
4. **Webhook Handler**:
   - Endpoint (`/api/webhooks/github`) to receive GitHub payloads.
   - Logic to parse the payload, match it against database rules (including advanced filters), and format a Markdown message.
5. **Discord Publisher**:
   - Logic to push the formatted message to the saved Discord Webhook URL.

## Database Schema (Draft)
- **Users Table**: Stores user info, GitHub OAuth tokens, Discord OAuth tokens.
- **Rules Table**:
  - `id` (UUID)
  - `user_id` (FK to Users)
  - `github_repo_full_name` (e.g., "user/repo")
  - `trigger_event` (e.g., "push", "pull_request", "issues")
  - `filter_branch` (Optional: e.g., "main")
  - `filter_action` (Optional: e.g., "opened", "closed")
  - `discord_webhook_url` (The URL to POST the message to)
  - `discord_channel_name` (For display purposes)

## Next Steps for Development
1. **Initialize Project**: Create Next.js app (`npx create-next-app@latest`).
2. **Setup Supabase**: Create a Supabase project and define tables.
3. **OAuth Setup**: Create GitHub and Discord Developer Applications and configure credentials in `.env`.
4. **Build UI**: Create the dashboard and rule-creation forms.
5. **Implement Webhook Logic**: Build the GitHub webhook receiver and Discord sender.
