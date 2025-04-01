# Simple Finances Bot

A Telegram bot for personal expense tracking, built with Node.js and TypeScript.

## Features

- 💰 Track daily expenses by simply sending amount and description
- 📊 View statistics by day, week, or month
- 🏷️ Categorize expenses for better organization
- 📋 Manage custom expense categories
- 📱 User-friendly interface with button navigation
- 🔄 Automatic database migrations
- 🔒 Data persistence across deployments

## Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: SQLite with Drizzle ORM
- **Bot Framework**: node-telegram-bot-api
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Installation

### Prerequisites

- Node.js 18+ or Docker
- A Telegram Bot token (get one from [@BotFather](https://t.me/botfather))

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/simple-finances-bot.git
   cd simple-finances-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Add your Telegram Bot token to the `.env` file:
   ```
   BOT_TOKEN=your_bot_token_here
   DB_PATH=./data/expenses.db
   ```

5. Build and start the bot:
   ```bash
   npm run build
   npm start
   ```

### Using Docker

1. Create a `.env` file with your Telegram Bot token
2. Run the bot using Docker Compose:
   ```bash
   docker compose up -d
   ```

## Deployment

The bot includes a GitHub Actions workflow that automatically deploys to a self-hosted runner when changes are pushed to the main branch.

### Server Setup

Before the first deployment, initialize the server:

```bash
sudo ./scripts/init-server.sh
```

This will create the necessary directories and set up permissions.

## Usage

Start the bot by sending `/start` command. Then:

1. **Add an expense**: Simply send a message with amount and description (e.g., "1000 groceries")
2. **Categorize expenses**: Use the "Распределить расходы" button to assign categories
3. **View statistics**: Click the "Статистика" button and choose a time period
4. **Manage categories**: Add or remove your own expense categories
5. **Clear history**: Delete all expense records (with confirmation)

## Database Management

The bot uses SQLite with automatic migrations:

- Migrations are defined in `src/db/migrations/index.ts`
- The database is automatically initialized on startup
- To rollback migrations manually:
  ```bash
  npm run db:rollback [targetVersion]
  ```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
