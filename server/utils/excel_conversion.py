import pandas as pd
import subprocess, tempfile, os
from io import BytesIO


async def convert_to_excel(file: bytes, ext: str) -> bytes:
    match ext.lower():
        case 'xlsb':
            content = await xlsb_to_xlsx(file)
            return content
        case 'xlsx':
            content = await xlsx_to_xlsb(file)
            return content
        

# Does not account for excel formatting, best used for sheets with raw data
def xlsb_to_xlsx(file: bytes) -> bytes:
    try:
        input_buffer = BytesIO(file)
        xls = pd.read_excel(input_buffer, engine='pyxlsb')
        output_buffer = BytesIO()
        
        with pd.ExcelWriter(output_buffer, engine='openpyxl') as writer:
            for sheet in df.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet)
                df.to_excel(writer, sheet_name=sheet, index=False)
                
        output_buffer.seek(0)   
        return output_buffer.read()
    
    except Exception as e:
                raise Exception(f"xlsb_to_xlsx: Failed to convert xlsb to xlsx → {e}") from e
        

def xlsx_to_xlsb(file: bytes) -> bytes:
    try:
        tmp_xlsx = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        tmp_xlsx.write(file)
        tmp_xlsx.flush()
        tmp_xlsx.close()
        
        out_dir = tempfile.mkdtemp()
        subprocess.run([
            "libreoffice", "--headless", "--convert-to", "xlsb:Calc8", "--outdir", out_dir, tmp_xlsx.name
        ], check=True)

        out_path = os.path.join(out_dir, os.path.basename(tmp_xlsx.name).replace(".xlsx", ".xlsb"))
        with open(out_path, "rb") as f:
            data = f.read()

        os.remove(tmp_xlsx.name)
        os.remove(out_path)
        return data
        
    except Exception as e:
        raise Exception(f"xlsx_to_xlsb: Failed to convert xlsx to xlsb → {e}") from e
