import logging
import csv
import tabula
import pandas as pd
import zipfile

from utils.excel_conversion import convert_xlsx_to_xlsb
from models import FileStatus
from utils.decorators import log_func
from io import BytesIO, StringIO

log = logging.getLogger(__name__)

@log_func
def convert_to_csv(file: bytes, ext: str) -> bytes | FileStatus:
    csv_conversion_dict = {
        ".xlsx": convert_excel_to_csv,
        ".xls": convert_excel_to_csv,
        ".xlsb": convert_excel_to_csv,
        ".pdf": convert_pdf_to_csv,
        ".txt": convert_txt_to_csv,
        ".zip": convert_zip_to_csv,
    }
    
    func = csv_conversion_dict.get(ext)
    if not func:
        return { 'status': 'failure', 'error': f"No conversion function for extension {ext}" }
    
    log.debug(f"Calling function {func.__name__}")
    if ext in ["xls", "xlsx", "xlsb"]:
        csv_conversion = func(file, ext)
    else:
        csv_conversion = func(file)
        
    if isinstance(csv_conversion, dict):
        log.error(f"{func.__name__}: Failed to convert file to csv. {csv_conversion.get('error', 'unknown error occurred')}")
    else:
        log.debug(f"{func.__name__}: Successfully converted file to csv")
    return csv_conversion
        

def convert_excel_to_csv(file: bytes, ext: str) -> bytes | FileStatus:
    pass

@log_func
def convert_txt_to_csv(file: bytes) -> bytes | FileStatus:
    try:
        decoded_text = file.decode('utf-8')
        lines = decoded_text.splitlines()
        rows = [line.split(",") for line in lines if line.strip()]
        
        output_buffer = StringIO()
        writer = csv.writer(output_buffer)
        writer.writerows(rows)
        
        csv_bytes = output_buffer.getvalue().encode("utf-8")
        return csv_bytes
    except Exception as e:
        return { "status": "failure", "error": str(e) }

@log_func
def convert_pdf_to_csv(file: bytes) -> bytes | FileStatus:
    try:
        pdf_stream = BytesIO(file)
        
        dfs = tabula.read_pdf(
            pdf_stream,
            pages="all",
            multiple_tables=True
        )
        
        if not dfs:
            raise Exception("No tables found in PDF")
        
        output = StringIO()
        
        for i, df in enumerate(dfs):
            if i > 0:
                output.write("\n")
            df.to_csv(output, index=False)
            
        return output.getvalue().encode("utf-8")
    
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }

@log_func
def convert_zip_to_csv(file: bytes) -> bytes | FileStatus:
    try:
        with zipfile.ZipFile(BytesIO(file)) as z:
            
            csv_file = [i for i in z.namelist() if i.lower().endswith(".csv")]
            
            if not csv_file:
                raise Exception("File is not a compressed csv")
            
            csv_name = csv_file[0]
            
        return z.read(csv_name)
    
    except Exception as e:
        return { 'status': 'failure', "error": str(e) }



