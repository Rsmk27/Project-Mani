from fastapi import APIRouter, Request, Header, HTTPException, Response
from telegram import Update
from app.bot.instance import bot_app
from app.config.settings import settings
from app.utils.logger import logger

router = APIRouter()

@router.post("/webhook")
async def telegram_webhook(request: Request, x_telegram_bot_api_secret_token: str = Header(None)):
    """
    Handle incoming Telegram webhook updates.
    Verifies the secret token to ensure the request is from Telegram.
    """
    if not x_telegram_bot_api_secret_token:
        logger.warning("Webhook request missing secret token header")
        raise HTTPException(status_code=401, detail="Missing secret token")

    if x_telegram_bot_api_secret_token != settings.TELEGRAM_SECRET_TOKEN:
        logger.warning("Webhook request with invalid secret token")
        raise HTTPException(status_code=403, detail="Invalid secret token")

    try:
        # Parse JSON payload
        payload = await request.json()

        # Create Update object and process it
        update = Update.de_json(payload, bot_app.bot)
        await bot_app.process_update(update)

        return Response(status_code=200)
    except Exception as e:
        logger.error(f"Error processing webhook update: {str(e)}")
        # We return 200 to Telegram even on error so it doesn't endlessly retry bad updates
        return Response(status_code=200)

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok", "service": "telegram-mani-bot"}
