# Telegram Mani Bot

A production-ready Telegram bot for "Project Mani". This bot receives user messages and proxies them to the Mani backend API, presenting the AI's response back to the user.

## Features
- Async architecture using FastAPI and python-telegram-bot
- Webhook-based integration
- Typing indicators while waiting for backend response
- Robust error handling and retries
- Clean architecture layout

## Setup Guide

1. Clone the repository and navigate into the `telegram-mani-bot` directory.
2. Create a virtual environment: `python3.12 -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`

## Environment Setup

Copy the example env file:
```bash
cp .env.example .env
```
Update `.env` with your actual secrets:
- `TELEGRAM_BOT_TOKEN`: Obtain from BotFather on Telegram.
- `TELEGRAM_SECRET_TOKEN`: A strong secret used to verify incoming webhook requests.
- `WEBHOOK_URL`: Your deployed application URL (e.g. `https://your-bot.railway.app/webhook`).
- `BACKEND_API_URL`: `https://project-mani-c0t3.onrender.com/api/chat`

## Telegram Webhook Setup

Once you deploy the bot and have a public URL:
1. Ensure your `.env` contains the correct `WEBHOOK_URL`.
2. The bot will automatically configure its webhook with Telegram on startup via the FastAPI lifespan hook.
3. It will also delete the webhook gracefully when shutting down.

## Local Run Instructions

If using webhook mode locally, you must expose your local port (e.g., using ngrok):
```bash
ngrok http 8000
```
Update `.env` with the ngrok URL: `WEBHOOK_URL=https://<your-ngrok-id>.ngrok-free.app/webhook`

Start the server:
```bash
uvicorn app.main:app --reload
```

## Railway Deployment Steps

1. Create a new project in Railway from your GitHub repo.
2. The project uses the `railway.json` and `Dockerfile`.
3. Add the required environment variables in the Railway dashboard (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_SECRET_TOKEN`, `BACKEND_API_URL`).
4. Wait for deployment to complete and retrieve your public Railway domain.
5. Update the `WEBHOOK_URL` variable to `https://<your-railway-domain>/webhook`.
6. Restart the deployment to trigger the webhook registration.

## Render Deployment Steps

1. Connect your repository to Render.
2. Use the "Blueprint" feature and point it to the provided `render.yaml`.
3. Render will auto-detect the configuration. Provide the missing environment variables (`TELEGRAM_BOT_TOKEN`, `WEBHOOK_URL`).
4. Deploy the service, grab the Render URL, and set it as `WEBHOOK_URL`.
