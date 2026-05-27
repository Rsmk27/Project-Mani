from telegram.ext import Application, CommandHandler, MessageHandler, filters
from app.config.settings import settings
from app.bot.handlers import start_command, help_command, reset_command, handle_message
from app.utils.logger import logger

def setup_application() -> Application:
    """Initialize and configure the Telegram bot application."""
    if not settings.TELEGRAM_BOT_TOKEN or settings.TELEGRAM_BOT_TOKEN == "your_telegram_bot_token_here":
        logger.warning("TELEGRAM_BOT_TOKEN is not set correctly. Bot will not function properly.")

    # Build application
    application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("reset", reset_command))

    # Handle regular text messages (excluding commands)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    return application

# Global bot instance
bot_app = setup_application()
