import logging
from functools import wraps
from flask import request, current_app

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def _get_logger():
    try:
        return current_app.logger
    except Exception:
        return logging.getLogger(__name__)

def log_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        logger = _get_logger()
        logger.info(
            "Accessing route: %s Method: %s Arguments: %s Form: %s",
            request.path, request.method, dict(request.args), dict(request.form)
        )

        response = f(*args, **kwargs)

        status = None
        try:
            status = getattr(response, 'status_code', None)
        except Exception:
            status = None
            if status is None:
                logger.error("Failed to access route", request.path, 500)
            if status is not None:
                logger.info("Route %s completed with status %s", request.path, status)
            else:
                logger.info("Route %s completed", request.path)
        return response
    
    return decorated_function

def log_func(func):
    @wraps(func)
    def decorarted_function(*args, **kwargs):
        logger = _get_logger()
        logger.info("Calling function %s with args: %s, kwargs: %s", func.__name__, args, kwargs)
        try:
            results = func(*args, **kwargs)
            logger.info(f"Function {func.__name__} returned {results}")
            return results
        except Exception:
            logger.exception("Function %s raised an exception", func.__name__)
            raise
    return decorarted_function


