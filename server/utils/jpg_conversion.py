import logging

from models import FileStatus
from utils.decorators import log_func

log = logging.getLogger(__name__)

@log_func
def convert_to_jpg(file: bytes, ext: str) -> bytes | FileStatus:
    jpg_conversion_dict = {
        ".png": convert_png_to_jpg,
        ".txt": convert_txt_to_jpg,
        ".pdf": convert_pdf_to_jpg,
        ".zip": convert_zip_to_jpg
    }
    
    func = jpg_conversion_dict.get(ext)
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }
    
    log.debug(f"Calling function {func.__name__}")
    jpg_conversion = func(file)
    
    if isinstance(jpg_conversion, dict):
        log.error(f"{func.__name__}: Failed to convert file to jpg. {jpg_conversion.get('error', "Unknown error")}")
        return jpg_conversion
    else:
        log.debug(f'{func.__name__}: Successfully converted file to jpg')
        return jpg_conversion
    
@log_func       
def convert_png_to_jpg(file: bytes) -> bytes | FileStatus:
    pass

@log_func
def convert_pdf_to_jpg(file: bytes) -> bytes | FileStatus:
    pass

@log_func
def convert_zip_to_jpg(file: bytes) -> bytes | FileStatus:
    pass

@log_func
def convert_txt_to_jpg(file: bytes) -> bytes | FileStatus:
    pass

