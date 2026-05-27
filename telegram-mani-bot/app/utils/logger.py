import logging
import sys

def setup_logger():
    """Configure and return the application logger."""
    logger = logging.getLogger("telegram_mani_bot")

    if not logger.handlers:
        logger.setLevel(logging.INFO)

        # Console handler with formatting
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)

        logger.addHandler(handler)

    return logger

logger = setup_logger()
