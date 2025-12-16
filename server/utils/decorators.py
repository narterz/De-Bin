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
            request.path, request.method, dict(request.args), truncate(dict(request.form))
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
        logger.info("Calling function %s with args: %s, kwargs: %s", func.__name__, truncate_str(str(truncate(args))), truncate_str(str(truncate(kwargs))))
        try:
            results = func(*args, **kwargs)
            logger.info("Function %s returned %s", func.__name__, truncate(results))
            return results
        except Exception:
            logger.exception("Function %s raised an exception", func.__name__)
            raise
    return decorarted_function

def truncate(obj, max_len=100):
    if isinstance(obj, str) and len(obj) > max_len:
        return obj[:max_len] + "..."
    elif isinstance(obj, dict):
        return {k: truncate(v, max_len) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [truncate(item, max_len) for item in obj]
    else:
        return obj
    
def truncate_str(string, max_len=100):
    if len(string) > max_len:
        return string[:max_len] + "..."
    return string


