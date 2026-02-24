import logging
import zipfile

from models import FileStatus
from utils.decorators import log_func
from io import BytesIO

log = logging.getLogger(__name__)

# Unzip file will be avaliable in the next update

@log_func
def convert_to_zip(file: bytes, ext: str) -> bytes | FileStatus:
    zip_conversion_dict = {
        ".csv": zip_file,
        ".txt": zip_file
    }
    func = zip_conversion_dict.get(ext)
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }

    log.debug(f"Calling function {func.__name__}")
    zip_conversion = zip_file(file)
    
    if isinstance(zip_conversion, dict):
        log.error(f"zip_file: Failed to convert file to jpg. {zip_conversion.get('error', "Unknown error")}")
        return zip_conversion
    else:
        log.debug(f'zip_file: Successfully converted file to jpg')
        return zip_conversion

@log_func  
def unzip_file(file: bytes, ext: str) -> bytes | FileStatus:
    try:
        with zipfile.ZipFile(BytesIO(file)) as z:
            new_file = [i for i in z.namelist() if i.lower().endswith(ext)]
            
            if not new_file:
                raise Exception(f"File is not compressed {ext}")
            
            file_name = new_file[0]
        return z.read(file_name)

    except Exception as e:
        return { 'status': 'failure', "error": str(e) }
    
@log_func
def zip_file(file: bytes) -> bytes | FileStatus:
    try:
        buffer = BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr('file', file)
        return buffer.getvalue()
            
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }