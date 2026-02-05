import logging
import csv
import pandas as pd

from io import StringIO
from models import FileStatus
from utils.decorators import log_func

log = logging.getLogger(__name__)

@log_func
def convert_to_txt(file: bytes, ext: str) -> bytes | FileStatus:
    txt_conversion_dict = {
        ".csv": convert_csv_to_txt,
        ".xlsx": convert_xlsx_to_txt
    }
    func = txt_conversion_dict.get(ext)
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }
    
    log.debug(f"Calling function {func.__name__}")
    txt_conversion = func(file)
    
    if isinstance(txt_conversion, dict):
        log.error(f"{func.__name__}: Failed to convert file to txt. {txt_conversion.get('error', "Unknown error")}")
        return txt_conversion
    else:
        log.debug(f'{func.__name__}: Successfully converted file to txt')
        return txt_conversion

@log_func
def convert_csv_to_txt(file: bytes) -> bytes | FileStatus:
    try:
        file_str = file.decode('utf-8')
        buffer = StringIO(file_str)
        csv_reader = csv.reader(buffer)
        rows = list(csv_reader)
        
        txt_string_data = ""
        for row in rows:
            txt_string_data += " ".join(row) + "\n"
        
        txt_bytes = txt_string_data.encode('utf-8')
        return txt_bytes
            
    except Exception as e:
        return { "status": "failure", "error": str(e) }
        

@log_func
def convert_xlsx_to_txt(file: bytes) -> bytes | FileStatus:
    try:
        df = pd.read_excel(file)
        txt_string = df.to_string(index=False, na_rep='')
        txt_bytes = txt_string.encode('utf-8')

        return txt_bytes
    
    except Exception as e:
        return { "status": "failure", "error": str(e) }