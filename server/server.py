from curses import meta
from importlib import metadata
from flask import Flask, jsonify, request
from flask_cors import CORS
from dataclasses import asdict
from dotenv import load_dotenv
import mimetypes

from models import FileMetadata, FileConversion, FileStatus, FileState

from utils.handle_dir import clean_tmp, remove_file_from_tmp, create_tmp, update_file_name, update_file_size
from utils.excel_conversion import convert_excel
from utils.pdf_conversion import convert_to_pdf
from utils.csv_conversion import convert_to_csv
from utils.jpg_conversion import convert_to_jpg
from utils.png_conversion import convert_to_png

import os
import json


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "/tmp/"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

load_dotenv()

# Returns updated FileStatus
@app.route('/')
def index():
    return "Backend is running", 200


@app.route("/api/upload", methods=['POST'])
def save_file() -> FileStatus:
    file_status: FileStatus = {
        "status": "idle",
        "error": ""
    }
    try:
        if 'file' not in request.files:
            raise FileNotFoundError("No file part in the request")
        
        uploaded_file = request.files['file']
        file_id = request.form.get('id')
        file_name = request.form.get('file_name')
        tmp_file_name = f"{file_name}_{file_id}"
        
        save_to_tmp = create_tmp(tmp_file_name, uploaded_file)
        file_status['status'] = save_to_tmp['status']
        file_status['error'] = save_to_tmp['error']
        
        if file_status['status'] == 'failure':
            app.logger.error("save_file: Failed to save file in backend: %s", file_status['error'])
            return jsonify(file_status), 500
        else:
            app.logger.info(f"save_file: Successfully added file {file_name} to /tmp folder")
            return jsonify(file_status), 200

    except FileNotFoundError as e:
        app.logger.error("File could not be saved to backend. Check client side functions uploadFileToBackend, handleFileUpload and slice processFiles")
        file_status["status"] = "failure"
        file_status["error"] = f"Could not find file: {e}"
        return jsonify(file_status), 400
    except Exception as e:
        app.logger.error("Major server error. We got some fixing to do...")
        file_status["status"] = "failure"
        file_status["error"] = f"Failed to save file: {e}"
        return jsonify(file_status), 500


@app.route('/api/cleanup', methods=['GET'])
def cleanup_tmp():
    dir_response = clean_tmp('/tmp')
    return jsonify({ 'status': dir_response['status'], 'error': dir_response['error'] })
        

@app.route('/api/removeFile', methods=['POST'])
def remove_file():
    file_status: FileStatus = {
        "status": "idle",
        "error": ""
    }
    try:
        file_id = request.form.get('id')
        file_name = request.form.get('file_name')
        if not file_id or not file_name:
            raise FileNotFoundError("Missing id or file_name in request")
        
        tmp_file_path = f"/tmp/{file_name}_{file_id}"
        remove_file_response = remove_file_from_tmp(tmp_file_path)
        file_status['status'] = remove_file_response['status']
        file_status['error'] = remove_file_response['error']
        
        if file_status['status'] == 'failure':
            app.logger.error(f"remove_file: Failed to remove file {tmp_file_path}: {file_status['error']}")
            return jsonify(file_status), 500
        
        app.logger.info(f"Successfully removed file {tmp_file_path}")
        return jsonify(file_status), 200
    
    except Exception as e:
        app.logger.error(f"Major server error in remove_file: {str(e)}")
        return jsonify({'status': 'failure', 'error': str(e)}), 500

@app.route('/api/convertFile', methods=['POST'])
async def convert_file() -> FileState:
    try:
        file_state_json = request.form.get('fileState')
        if not file_state_json:
            raise ValueError("No fileState found in request")
        
        file_state_dict = json.loads(file_state_json)
        
        file_id = file_state_dict['metadata']['id']
        file_name = file_state_dict['metadata']['fileName']
        current_extension = file_state_dict['metadata']['fileExtension']
        conversion = file_state_dict['fileConversions']['conversion'][1]
        
        tmp_file_path = f"/tmp/{file_name}_{file_id}"
        if not os.path.exists(tmp_file_path):
            raise FileNotFoundError(f"File {tmp_file_path} not found")

        # Switch case to determine where to send the file
        with open(tmp_file_path, 'rb') as f:
            content = f.read()
            match conversion:
                case 'pdf':
                    app.logger.debug("Routing file to convert_to_pdf")
                    content = await convert_to_pdf(content, current_extension)
                    file_state_dict = update_file_state(content, file_state_dict)
                case 'csv':
                    content = await convert_to_csv(content, current_extension)
                case 'jpg':
                    content = await convert_to_jpg(content, current_extension)
                # case 'zip':
                #     pass
                case 'png':
                    content = await convert_to_png(content, current_extension)
                case 'xlsx' | 'xlsb' | 'xls':
                    app.logger.debug("Routing file to convert_excel")
                    content = await convert_excel(content, current_extension)
                    new_file_metadata = update_file_state(content, file_state_dict)
        return jsonify(file_state_dict)

    except json.JSONDecodeError as e:
        app.logger.error(f"convert_file: Invalid JSON in fileState: {str(e)}")
        return jsonify({'status': 'failure', 'error': 'Invalid fileState JSON'}), 400
    except Exception as e:
        app.logger.error(f"convert_file: Error processing file conversion: {str(e)}")
        return jsonify({'status': 'failure', 'error': str(e)}), 500

async def update_file_state(content: bytes, file_state: FileState) -> FileState:
    try: 
        old_file_name = file_state['metadata']['file_name']
        new_ext = file_state['conversion']['conversion']
        new_file_name = update_file_name(old_file_name, new_ext)
        # upload file content to tmp
        await create_tmp(new_file_name, content)
        # update file size
        new_file_path = f'/tmp/{new_file_name}'
        new_file_size = await update_file_size(new_file_path)
        # update file type
        mime_type, _ = mimetypes.guess_type(new_file_path)
        updated_file_type = mime_type if mime_type else "application/octet-stream"
        new_file_state: FileState = {
            "metadata": {
                "file": content,
                "file_name": new_file_name,
                "file_size": new_file_size,
                "file_type": updated_file_type,
                "file_name_shortened": file_state['metadata']['file_name_shortened'],
                "file_extension": new_ext
            },
            "status": file_state['status'],
            "conversion": file_state['conversion']
        }
        return new_file_state
    except Exception as e:
        app.logger.error(f"Failed to update file state with error {str(e)}")
        new_file_state: FileState = {
            "metadata": file_state["metadata"],
            "conversion": file_state['conversion'],
            "status": { "status": "failure", 'error': str(e) }    
        }

if __name__ == "__main__":
    # To run in development mode change FLASK_ENV to development in server env file
    env = os.environ.get("FLASK_ENV", "development")
    port = os.environ.get("PORT", 8081)
    
    debug_mode = env == "development"
        
    app.run(debug=debug_mode, port=port)
