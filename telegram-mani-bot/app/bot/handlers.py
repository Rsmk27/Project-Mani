import asyncio
from telegram import Update
from telegram.ext import ContextTypes
from telegram.constants import ChatAction

from app.services.api_client import api_client, APIClientError
from app.utils.logger import logger

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command."""
    user = update.effective_user
    welcome_message = (
        f"Hello {user.first_name}! 👋\n\n"
        "I am Mani, an AI assistant. How can I help you today?\n"
        "Send me a message and I'll connect you with our backend."
    )
    await update.message.reply_text(welcome_message)
    logger.info(f"User {user.id} started the bot.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command."""
    help_text = (
        "Here's how to use this bot:\n\n"
        "- Just type your message and I'll process it.\n"
        "- /start: Restart the conversation.\n"
        "- /help: Show this help message.\n"
        "- /reset: Reset your conversation history context."
    )
    await update.message.reply_text(help_text)

async def reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /reset command."""
    # In a real app, you might notify the backend to clear history for this user
    await update.message.reply_text("Your conversation context has been reset. Let's start fresh!")
    logger.info(f"User {update.effective_user.id} reset context.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular text messages."""
    if not update.message or not update.message.text:
        return

    user = update.effective_user
    message_text = update.message.text

    # Start continuous typing indicator in background
    typing_task = asyncio.create_task(keep_typing(update, context))

    try:
        # Send message to backend
        response_data = await api_client.send_message(
            user_id=user.id,
            username=user.username,
            message=message_text
        )

        # Extract response from backend JSON
        # Assuming the backend returns {"response": "Hello! ..."} based on requirements
        reply_text = response_data.get("response", "Sorry, I received an empty response from the backend.")

        # Cancel typing indicator
        typing_task.cancel()

        # Send reply to user
        await update.message.reply_text(reply_text)

    except APIClientError as e:
        typing_task.cancel()
        error_msg = "Sorry, I'm having trouble connecting to the backend right now. Please try again later."
        await update.message.reply_text(error_msg)
        logger.error(f"Handled API client error for user {user.id}: {str(e)}")

    except Exception as e:
        typing_task.cancel()
        error_msg = "An unexpected error occurred. Please try again later."
        await update.message.reply_text(error_msg)
        logger.error(f"Unexpected error handling message for user {user.id}: {str(e)}")

async def keep_typing(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Continuously show typing indicator until cancelled."""
    try:
        while True:
            await context.bot.send_chat_action(
                chat_id=update.effective_chat.id,
                action=ChatAction.TYPING
            )
            # Telegram typing action lasts for ~5 seconds
            await asyncio.sleep(4)
    except asyncio.CancelledError:
        # Expected when task is cancelled after API response
        pass
    except Exception as e:
        logger.error(f"Error in typing indicator task: {str(e)}")
