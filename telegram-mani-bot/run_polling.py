import os
import sys

# Add the current directory to python path to resolve imports correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.settings import settings
from app.bot.instance import bot_app
from app.utils.logger import logger

def main():
    logger.info("Starting Telegram Mani Bot in POLLING mode...")
    
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN in ("your_telegram_bot_token_here", ""):
        logger.error("TELEGRAM_BOT_TOKEN is not set or is still the placeholder. Please set it in your .env file.")
        sys.exit(1)
        
    logger.info(f"Connecting to Telegram bot using token: {settings.TELEGRAM_BOT_TOKEN[:6]}...{settings.TELEGRAM_BOT_TOKEN[-4:] if len(settings.TELEGRAM_BOT_TOKEN) > 10 else ''}")
    logger.info(f"Proxying backend requests to: {settings.BACKEND_API_URL}")

    # run_polling handles the event loop, initialization, starting, and clean shutdown automatically.
    bot_app.run_polling()

if __name__ == "__main__":
    main()
