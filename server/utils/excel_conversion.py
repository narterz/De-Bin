import base64
import pandas as pd
import os
from models import FileMetadata, FileConversion, FileStatus, FileState


def convert_excel(file: bytes, ext: str) -> FileState:
    pass

def xlsb_to_xlsx(file: bytes, ext: str) -> FileState:
    pass
        

def xlsx_to_xlsb(file: bytes, ext: str) -> FileState:
    pass


def convert_single_xlsx_sheet(file_state: FileState) -> FileState:
    pass

def convert_single_xlsb_sheet(file_state: FileState) -> FileState:
    pass

def convert_multiple_xlsb_sheets(file_state: FileState) -> FileState:
    pass

def convert_multiple_xlsx_sheets(file_state: FileState) -> FileState:
    pass

