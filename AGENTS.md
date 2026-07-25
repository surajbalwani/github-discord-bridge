<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-database-rules -->
# Supabase Database Execution (CRITICAL)

When executing database schema changes (`.sql` files or DDL), DO NOT attempt to run them locally using `node pg` or Supabase CLI if the connection string uses the direct IPv6 hostname (e.g., `db.[ref].supabase.co`), because the terminal environment lacks IPv6 support and will fail with `ENOTFOUND`.

Instead, automate it using GitHub Actions:
1. Create/update a `.sql` file with your schema changes.
2. Create/update a `.github/workflows/run-sql.yml` file that uses `psql` to execute the SQL file against the `SUPABASE_DB_URL`.
3. Commit and push. GitHub's runners have dual-stack IPv4/IPv6 support and will run the migration instantly.
<!-- END:supabase-database-rules -->
