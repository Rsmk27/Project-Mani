from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn

from app.config.settings import settings
from app.routes.webhook import router as webhook_router
from app.bot.instance import bot_app
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan manager.
    Sets up the webhook on startup and cleans up on shutdown.
    """
    logger.info("Starting up Telegram Mani Bot...")

    # Check if a valid token is present before trying to initialize bot
    if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_BOT_TOKEN != "your_telegram_bot_token_here" and settings.TELEGRAM_BOT_TOKEN != "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11":
        try:
            # Initialize bot application
            await bot_app.initialize()

            # Set Webhook if URL is configured
            if settings.WEBHOOK_URL and settings.WEBHOOK_URL != "https://your-app-url.railway.app/webhook":
                logger.info(f"Setting webhook to {settings.WEBHOOK_URL}")
                await bot_app.bot.set_webhook(
                    url=settings.WEBHOOK_URL,
                    secret_token=settings.TELEGRAM_SECRET_TOKEN,
                    allowed_updates=["message", "edited_message"]
                )
            else:
                logger.warning("WEBHOOK_URL not configured properly. Webhook not set.")
        except Exception as e:
            logger.error(f"Failed to initialize bot: {e}")
    else:
        logger.warning("TELEGRAM_BOT_TOKEN is missing or placeholder. Skipping Telegram bot initialization.")

    yield

    # Cleanup on shutdown
    logger.info("Shutting down...")
    if settings.WEBHOOK_URL:
        logger.info("Deleting webhook...")
        try:
            await bot_app.bot.delete_webhook()
        except Exception as e:
            logger.error(f"Error deleting webhook on shutdown: {e}")
    try:
        await bot_app.shutdown()
    except Exception as e:
        logger.error(f"Error shutting down bot: {e}")

# Create FastAPI app
app = FastAPI(
    title="Telegram Mani Bot",
    description="Webhook receiver for Telegram Mani Bot",
    version="1.0.0",
    lifespan=lifespan
)

# Include routes
app.include_router(webhook_router)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
