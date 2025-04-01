# Simple Finances Bot

## Deployment

### Prerequisites
- Docker
- Docker Compose

### Setup
1. Clone the repository:
```bash
git clone https://github.com/aleksey-savin/simple-finances-bot.git
cd simple-finances-bot
```
2. Modify the .env.example file and save it as .env
3. Run deploy.sh script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## CI/CD Setup

### Prerequisites
- Docker and Docker Compose installed on VM
- GitHub repository access
- Self-hosted runner access

### Setting up the runner
1. Create github-runner user:
```bash
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner
```

2. Install the runner:
```bash
chmod +x install-runner.sh
sudo ./install-runner.sh
```

3. Check runner status:
```bash
sudo systemctl status github-runner
```

### Deployment
The bot will be automatically deployed when:
- Push to main branch
- Manual trigger through GitHub Actions

### Monitoring
- Check GitHub Actions tab for deployment status
- View logs: `docker compose logs -f`
- Check runner status: `sudo systemctl status github-runner`
