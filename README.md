## Server Scripts

All maintenance scripts are located in `/scripts` directory:

### Main Scripts
- `init-server.sh` - Initialize server and set up permissions
- `deploy.sh` - Deploy the application
- `backup.sh` - Create database backup
- `rollback.sh` - Rollback to previous version

### Usage

Initialize server (first time or after system changes):
```bash
sudo /scripts/init-server.sh
```

Deploy application:
```bash
/scripts/deploy.sh
```

Create backup:
```bash
/scripts/backup.sh
```

Rollback to previous version:
```bash
/scripts/rollback.sh list          # List available backups
/scripts/rollback.sh latest        # Rollback to latest backup
/scripts/rollback.sh <backup-file> # Rollback to specific backup
```

### Directory Structure
```
/
├── opt/
│   ├── backups/telegram-bot/   # Backups
│   ├── telegram-bot/           # Application data
│   └── actions-runner/         # GitHub Actions
└── scripts/                    # Maintenance scripts
    ├── init-server.sh
    ├── deploy.sh
    ├── backup.sh
    ├── rollback.sh
    └── utils/
```

### Permissions
- All scripts are owned by github-runner
- Scripts are executable (755)
- Only init-server.sh requires sudo
```

Также обновим GitHub Actions workflow, чтобы использовать новые пути:

```yaml
# .github/workflows/deploy.yml
# ... остальной код остается прежним ...

      - name: Check prerequisites
        run: |
          source /scripts/utils/check-prerequisites.sh
          check_prerequisites
```

### Deployment
After initialization, you can deploy:

```bash
./deploy.sh
```

### Maintenance
To check or fix permissions after system updates:

```bash
sudo ./init-server.sh
```

### Troubleshooting
If you encounter permission issues:
1. Check the logs: `docker compose logs`
2. Verify permissions: `ls -la /opt/telegram-bot/data`
3. Run initialization again: `sudo ./init-server.sh`
