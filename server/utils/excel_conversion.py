from operator import index
import pandas as pd
import logging
import re

from models import FileStatus
from utils.decorators import log_func
from pyxlsb import open_workbook
from openpyxl import Workbook
from io import BytesIO

log = logging.getLogger(__name__)

@log_func
def convert_to_excel(file: bytes, ext: str) -> bytes | FileStatus:
    excel_conversion_dict = {
        ".xlsb": convert_xlsb_to_xlsx,
        ".csv": convert_csv_to_xlsx,
        ".txt": convert_txt_to_xlsx,
        ".pdf": convert_pdf_to_xlsx
    }
    func = excel_conversion_dict.get(ext)
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }
    
    log.debug(f"Calling function {func.__name__}")
    xlsx_conversion = func(file)
    
    if isinstance(xlsx_conversion, dict):
        log.error(f"{func.__name__}: Failed to convert file to xlsx. {xlsx_conversion.get('error', "Unknown error")}")
    else:
        log.debug(f"{func.__name__}: Successfully converted file to xlsx")
    return xlsx_conversion

@log_func     
def convert_xlsb_to_xlsx(file: bytes) -> bytes | FileStatus:
    try:        
        df_dict = pd.read_excel(BytesIO(file), engine='pyxlsb', sheet_name=None)
        output_buffer = BytesIO()
        
        sheet_name_set = set()
        with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
            for sheet_name, df in df_dict.items():
                # Sanitize sheet name
                sanitized_name = re.sub(r'[\/\\?*\[\]:]', '_', sheet_name).strip()
                if not sanitized_name:
                    sanitized_name = "Sheet"
                
                original_sanitized_name = sanitized_name
                counter = 1
                
                #Ensure unique names
                while sanitized_name in sheet_name_set:
                    sanitized_name = f"{original_sanitized_name}_{counter}"
                    counter += 1
                    
                sheet_name_set.add(sanitized_name)
                
                if sanitized_name != sheet_name:
                    log.warning(f"Sheet name {sheet_name} changed to {sanitized_name} due to sheet name value being invalid or missing")
                    
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                
        output_buffer.seek(0)
        xlsx_file = output_buffer.getvalue()
        
        return xlsx_file
            
    except Exception as e:
        return { "status": "failure", "error": str(e) }
    
    
def convert_csv_to_xlsx(file: bytes) -> bytes | FileStatus:
    try:
        df = pd.read_csv(BytesIO(file))
        output_buffer = BytesIO()
        
        with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False)
            
        output_buffer.seek(0)
        xlsx_file = output_buffer.getvalue()
        
        return xlsx_file
        
    except Exception as e:
        return { "status": "failure", "error": str(e) }

def convert_pdf_to_xlsx(file: bytes) -> bytes | FileStatus:
    try:
        pdf_stream = BytesIO(file)
        
        
    except Exception as e:
        raise e

def convert_txt_to_xlsx(file: bytes) -> bytes | FileStatus:
    pass
