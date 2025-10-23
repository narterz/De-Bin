import pypandoc
from utils.excel_conversion import xlsb_to_xlsx
from models import FileState

def convert_to_pdf(file: bytes, ext: str) -> FileState:
    pass

def convert_csv_to_pdf(file):
    pass

def convert_excel_to_pdf(file):
    # If the extension is xlsb convert to xlsx first
    pass