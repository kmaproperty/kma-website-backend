# Backend Development Guide

NestJS + TypeORM + PostgreSQL on AWS EC2.

## Branches and what they deploy to

Auto-deploy is configured via GitHub Actions (`.github/workflows/deploy.yml`). Pushing to either branch SSH-deploys to EC2.

| Branch | EC2 directory | Port | URL | DB |
|---|---|---|---|---|
| `master` | `~/kmaproperty/kma-website-backend` | 3000 | http://15.207.193.17:3000 | `kma` |
| `develop` | `~/kmaproperty/kma-website-backend-dev` | 3001 | http://15.207.193.17:3001 | `kma` |

**Note:** Both backends currently share the same `kma` database. Migrations or schema changes affect prod data — coordinate before merging.

The frontend Amplify config maps:
- buyer/seller `main` → backend port 3000
- buyer/seller `develop` → backend port 3001

## Workflow for developers

1. **Branch off `develop`**:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/<short-name>
   ```

2. **Push and open PR into `develop`**:
   ```bash
   git push -u origin feature/<short-name>
   gh pr create --base develop
   ```

3. **Merge to `develop`** → GitHub Actions runs `/home/ubuntu/deploy-dev.sh` on EC2 → dev backend rebuilt + restarted in ~2-3 min.

4. **Promote to prod** by opening PR `develop` → `master`. Merge → `/home/ubuntu/deploy.sh` runs → prod backend rebuilt + restarted.

5. **Hotfixes** branch off `master`, then merge into BOTH `master` and `develop`.

**Do NOT push directly to `master` or `develop`.**

## Local development

```bash
git clone https://github.com/kmaproperty/kma-website-backend.git
cd kma-website-backend
npm install
cp .env.example .env   # if exists; otherwise ask team lead
npm run start:dev      # http://localhost:3000
```

Required env vars (see EC2 `.env` for current values):
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASS`, `POSTGRES_DB`
- `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_BUCKET`, `AWS_REGION`
- `JWT_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `DOCUSIGN_*` (path to `docusign-private-key.pem`)
- `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`
- `ZOHO_FLOW_*` webhooks
- `DB_SYNCHRONIZE=false` — never set true on shared/prod DB

## Database schema changes

**TypeORM `synchronize` is OFF in dev and prod** because both share the `kma` DB. To change schema:

1. Add/modify the entity class.
2. Generate a migration:
   ```bash
   npm run typeorm:generate -- --name DescribeChange
   ```
3. Review the generated migration in `src/migration/` — make sure DROPs and NOT-NULL adds won't break existing rows.
4. Commit it with the entity change in the same PR.
5. After merge, the migration runs automatically on app start (or invoke `npm run typeorm:run` manually).

## Build + deploy details

**GitHub secrets required** (set in repo settings → Secrets and variables → Actions):
- `EC2_HOST` = `15.207.193.17`
- `EC2_USER` = `ubuntu`
- `EC2_SSH_KEY` = contents of `kma-backend-new.pem`

**Deploy scripts on EC2:**
- `/home/ubuntu/deploy.sh` — runs on `master` push: pulls master, npm install, build, `pm2 restart kma-backend`
- `/home/ubuntu/deploy-dev.sh` — runs on `develop` push: pulls develop, npm install, build, `pm2 restart kma-backend-dev`

**Watching builds:** GitHub Actions tab on the repo.
**Watching runtime:** SSH to EC2 → `pm2 logs kma-backend` or `pm2 logs kma-backend-dev`.

## Common pitfalls

- **EC2 disk fills repeatedly** (6.8G root volume). If a deploy fails with `ENOSPC`, SSH in and run: `sudo apt-get clean && sudo journalctl --vacuum-size=10M && rm -rf ~/.npm/_cacache`.
- **PM2 not in PATH** when SSHing? Source nvm: `export PATH=/home/ubuntu/.nvm/versions/node/v22.20.0/bin:$PATH`.
- **Don't commit** `.env`, `*.pem`, `docusign-private-key.pem`. They're gitignored — keep them that way.
- **CORS is `origin: '*'`** currently. Tighten before going public-facing.
- **Backend never calls Surepass directly** — frontend Next.js API routes proxy those calls. Don't add Surepass env vars here.

## Who to ping

Infra (EC2, RDS, deploy scripts) — Dhruv.
Code review on PRs — team lead.
