from tkinter import Canvas
import pandas as pd
from server import app
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import mimetypes


from utils.excel_conversion import xlsb_to_xlsx
from models import FileState

def convert_to_pdf(file: bytes, ext: str) -> bytes:
    match ext:
        case 'csv':
            app.logger.debug("[convert_to_pdf] Converting csv to pdf")
            return convert_csv_to_pdf(file)
        case 'xls' | 'xlsx' | 'xlsb':
            app.logger.debug("[convert_to_pdf] Converting excel to pdf")
            return convert_excel_to_pdf(file, ext)
        case 'txt':
            app.logger.debug("[convert_to_pdf] Converting txt to pdf")
            return convert_txt_to_pdf(file)
        case 'png':
            app.logger.debug("[convert_to_pdf] Converting png to pdf")
            return convert_png_to_pdf(file)
        case 'jpg':
            app.logger.debug("[convert_to_pdf] Converting jpg to pdf")
            return convert_jpg_to_pdf(file)
        case _:
            raise ValueError(f"Unsupported extension: {ext}")


def convert_txt_to_pdf(file: bytes) -> bytes:
    try: 
        txt = file.decode('utf-8', errors='ignore')
    except UnicodeDecodeError:
        txt = file.decode('latin-1')
    
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