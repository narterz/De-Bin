import logging
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from models import FileStatus
from utils.decorators import log_func
from pdf2image import convert_from_bytes

log = logging.getLogger(__name__)

# Conversions to txt and pdf will come in another update

@log_func
def convert_to_jpg(file: bytes, ext: str) -> bytes | FileStatus:
    jpg_conversion_dict = {
        ".png": convert_png_to_jpg,
        ".pdf": convert_pdf_to_jpg,
        ".txt": convert_txt_to_jpg,
        ".xlsx": convert_xlsx_to_jpg
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
    try:
        buffer = BytesIO(file)
        image = Image.open(buffer)
        if image.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            if image.mode == "P":
                image = image.convert("RGBA")
            background.paste(image, mask=image.split()[-1])
            image = background
            
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        output_buffer = BytesIO()
        image.save(output_buffer, format='JPEG', quality=95)
        output_buffer.seek(0)
        jpg_file = output_buffer.getvalue()
        
        return jpg_file
        
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }

@log_func
def convert_pdf_to_jpg(file: bytes) -> bytes | FileStatus:
    try:
        image = convert_from_bytes(file, fmt="JPEG")
        captured_image = image[0]
        output_buffer = BytesIO()
        
        captured_image.save(output_buffer, format="JPEG")
        output_buffer.seek(0)
        jpeg_file = output_buffer.getvalue()
        
        return jpeg_file
    
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }


@log_func
def convert_xlsx_to_jpg(file: bytes) -> bytes | FileStatus:
    try:
        excel_buffer = BytesIO(file)
        df = pd.read_excel(excel_buffer, sheet_name=0)
        
        fig, ax = plt.subplots(figsize=(len(df.columns) * 1.5, len(df) * 0.4))
        ax.axis('off')
        
        ax.table(
            cellText=df.values,
            colLabels=df.columns,
            loc='center',
            cellLoc='center'
        )
        
        output_buffer = BytesIO()
        plt.savefig(output_buffer, format='jpeg', bbox_inches='tight', dpi=200)
        plt.close()
        
        output_buffer.seek(0)
        jpeg_file = output_buffer.getvalue()
        
        return jpeg_file
    
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    
@log_func
def convert_txt_to_jpg(file: bytes) -> bytes | FileStatus:
    try:
        img = Image.new('RGB', (800, 600), color = (255, 255, 255))
        img_draw = ImageDraw.Draw(img)
        
        font = ImageFont.load_default()
        img_draw.text((10, 10), file, font=font, fill=(0, 0, 0))
        
        output_buffer = BytesIO()
        
        img.save(output_buffer, "JPEG")
        output_buffer.seek(0)
        jpeg_file = output_buffer.getvalue()
        
        return jpeg_file

    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    

