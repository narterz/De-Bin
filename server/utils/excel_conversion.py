import base64
import pandas as pd
import os
from models import FileMetadata, FileConversion, FileStatus, FileState

def convert_xlsb_to_xlsx(file_state: FileState) -> FileState:
    
    # 1. Decode file content from base64, create a path in /tmp
    file_bytes = base64.b64decode(file_state.metadata.file)
    file_dir = f'/tmp/{file_state.metadata.file_name}.xlsx'
    sheet_name = file_state.metadata.file_name_shortened
    
    # 2. Save as .xlsx temp..
    with open(file_dir, "w") as file:
        file.write(file_bytes)
    
    # Convert xlsb to xlsx with pandas
    df = pd.read_excel(file_dir, sheet_name, engine="pyxlsb")
    
    
    # 4. update metadata for response
    
    pass

def convert_xlsx_to_xlsb(file_state: FileState) -> FileState:
    pass