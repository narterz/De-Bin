import logging

from pdf2image import convert_from_bytes
from models import FileStatus
from utils.decorators import log_func
from utils.zip_conversion import unzip_file
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

log = logging.getLogger(__name__)

@log_func
def convert_to_png(file: bytes, ext: str) -> bytes | FileStatus:
    png_conversion_dict = {
        ".jpg": convert_jpg_to_png,
        ".txt": convert_txt_to_png,
        ".pdf": convert_pdf_to_png,
    }
    
    if ext == '.zip':
        func = unzip_file(file, ext)
    else:
        func = png_conversion_dict.get(ext)
        
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }
    
    log.debug(f"Calling function {func.__name__}")
    png_conversion = func(file)
    
    if isinstance(png_conversion, dict):
        log.error(f"{func.__name__}: Failed to convert file to png. {png_conversion.get('error', "Unknown error")}")
        return png_conversion
    else:
        log.debug(f'{func.__name__}: Successfully converted file to png')
        return png_conversion
    
@log_func
def convert_jpg_to_png(file: bytes) -> bytes | FileStatus:
    try:
        image_stream = BytesIO(file)
        image = Image.open(image_stream)
        output_buffer = BytesIO()
        image.save(output_buffer, format='PNG')
        return output_buffer.getvalue()
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    
@log_func
def convert_txt_to_png(file: bytes) -> bytes | FileStatus:
    try:
        decoded_txt = file.decode('utf-8')
        new_image = Image.new("RGB", (800, 600), "white")
        image_drawn = ImageDraw.Draw(new_image)
        font = ImageFont.load_default()
        image_drawn.multiline_text((20, 20), decoded_txt, fill="black", font=font)
        
        output_buffer = BytesIO()
        new_image.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }

@log_func
def convert_pdf_to_png(file: bytes) -> bytes | FileStatus:
    try:
        pages = convert_from_bytes(file)
        if not pages:
            raise Exception("No pages found in PDF")
        output_buffer = BytesIO()
        pages[0].save(output_buffer, format='PNG')
        return output_buffer.getvalue()
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }