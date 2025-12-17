import pandas as pd
import subprocess, tempfile, os
import logging

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
        
def convert_xlsb_to_xlsx(file: bytes) -> bytes | FileStatus:
    pass
    

def convert_csv_to_xlsx(file: bytes) -> bytes | FileStatus:
    pass

def convert_txt_to_xlsx(file: bytes) -> bytes | FileStatus:
    pass

def convert_pdf_to_xlsx(file: bytes) -> bytes | FileStatus:
    pass
