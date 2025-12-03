import pandas as pd
import logging

from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from models import FileStatus

log = logging.getLogger(__name__)

def convert_to_pdf(file: bytes, ext: str) -> bytes | FileStatus:
    pdf_conversion_dict = {
        "jpg": convert_jpg_to_pdf,
        "png": convert_jpg_to_pdf,
        "txt": convert_txt_to_pdf,
        "xlsx": convert_excel_to_pdf,
        "csv": convert_csv_to_pdf,
    }
    
    func = pdf_conversion_dict.get(ext)
    log.debug(f"Calling function {func.__name__}")
    pdf_conversion = func(file)
    
    if pdf_conversion['status'] == 'error':
        error_message = pdf_conversion['error']
        log.error(f"{func.__name__}: Failed convert file to pdf. {error_message}")
    else: log.debug(f"{func.__name__}: Successfully converted file to pdf")
    
    return pdf_conversion

def convert_txt_to_pdf(file: bytes) -> bytes | FileStatus:
    try: 
        txt = file.decode('utf-8', errors='ignore')
    except UnicodeDecodeError:
        txt = file.decode('latin-1')
    
    try: 
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        y = height - 50
        
        for line in txt.splitlines():
            pdf.drawString(50, y, line)
            y -= 15
            if y < 50:
                pdf.showPage()
                y = height - 50
        pdf.save()
        buffer.seek(0)
        return buffer.read()
    except Exception as e:
        return {"status": 'failure', "error": str(e)}
    
def convert_csv_to_pdf(file: bytes) -> bytes:    
    buffer = BytesIO(file)
    df = pd.read_csv(buffer)
    
    data = [df.columns.tolist()] + df.values.tolist()
    
    output_pdf_doc = BytesIO()
    pdf_doc = SimpleDocTemplate(output_pdf_doc, pagesize=A4, leftMargin=18, rightMargin=18, topMargin=18, bottomMargin=18)

    
    # Create table and style it
    table = Table(data, repeatRows=1, hAlign="LEFT")
    table.setStyle(Table([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F2F2")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    
    # Build PDF
    pdf_doc.build([table])
    pdf_bytes = output_pdf_doc.getvalue()
    output_pdf_doc.close()
    
    return pdf_bytes
    
    

def convert_excel_to_pdf(file: bytes) -> bytes:
    # If the extension is xlsb convert to xlsx first
    pass


def convert_png_to_pdf(file: bytes) -> bytes:
    pass

def convert_jpg_to_pdf(file: bytes) -> bytes:
    pass