from importlib import metadata
from flask import Flask, jsonify, request
from flask_cors import CORS
from dataclasses import asdict
import mimetypes
import os
import json

from models import FileMetadata, FileConversion, FileStatus, FileState

from utils.decorators import log_func, log_route
from utils.handle_dir import clean_dir, remove_file, create_file, update_file_name, update_file_size
from utils.excel_conversion import convert_excel
from utils.pdf_conversion import convert_to_pdf
from utils.csv_conversion import convert_to_csv
from utils.jpg_conversion import convert_to_jpg
from utils.png_conversion import convert_to_png



app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "/tmp/"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Returns updated FileStatus
@app.route('/')
@log_route
def index():
    return "Backend is running", 200


@app.route("/api/upload", methods=['POST'])
@log_route
def save_file() -> FileStatus:
    if 'file' not in request.files:
        app.logger.error("save_file: File not found in request")
        return jsonify({'status': 'failure', 'error': 'No file part in the request'}), 400
    
    uploaded_file = request.files['file']
    file_id = request.form.get('id')
    file_name = request.form.get('file_name')
    if not file_id or not file_name:
        return jsonify({'status': 'failure', 'error': 'Missing id or file_name'}), 400
    
    file_path = f"{file_name}_{file_id}"
    create_tmp_file = create_file(file_path, uploaded_file)
    if create_tmp_file['status'] == 'failure':
        app.logger.error("save_file: Failed to save file: %s", create_tmp_file['error'])
        return jsonify(create_tmp_file), 500

    app.logger.info("save_file: Successfully added file %s to /tmp", file_name)
    return jsonify({'status': 'success'}), 200
  
@app.route('/api/cleanup', methods=['GET'])
@log_route
def cleanup_tmp():
    dir_response = clean_dir('/tmp')
    return jsonify({ 'status': dir_response['status'], 'error': dir_response['error'] })
        

@app.route('/api/removeFile', methods=['POST'])
@log_route
def remove_file() -> FileStatus:
    file_id = request.form.get('id')
    file_name = request.form.get('file_name')
    if not file_id or not file_name:
        app.logger.error("remove_file: file not found in request")
        return jsonify({'status': 'failure', 'error': 'No file arg in the request'}), 400
    
    file_path = f"{file_name}_{file_id}"
    remove_file_response = remove_file(file_path)
    if remove_file_response['status'] == 'failure':
        app.logger.error("remove_file: Failed to remove file: %s", remove_file['error'])
        return jsonify(remove_file_response), 500
    
    app.logger.info("remove_file: Successfully removed file %s", file_name)
    return jsonify(remove_file_response), 200

@app.route('/api/convertFile', methods=['POST'])
@log_route
async def convert_file() -> FileState:
    file_state_json = request.form.get('fileState')
    if not file_state_json:
        app.logger.error("convert_file: Request missing arg FileState")
        return jsonify({'status': 'failure', 'error': 'FileState arg not present in request'})
    
    file_state_dict = json.loads(file_state_json)
    file_id = file_state_dict['metadata']['id']
    file_name = file_state_dict['metadata']['fileName']
    current_extension = file_state_dict['metadata']['fileExtension']
    conversion = file_state_dict['fileConversions']['conversion'][1]
    tmp_file_path = f"/tmp/{file_name}_{file_id}"

    if not os.path.exists(tmp_file_path):
        app.logger.error("convert_file: Could not find file %s in /tmp", file_name)
        return jsonify({'status': 'failure', 'error': 'File not found'})
    
    try:
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
                    file_state_dict = update_file_state(content, file_state_dict)

        app.logger.info(f"convert_file: Successfully converted file {file_name} from {current_extension} to {conversion}")
        return jsonify(file_state_dict)
    
    except Exception as e:
        app.logger.error(f"convert_file: Failed to convert file {file_name} from {current_extension} to {conversion}")
        return jsonify({'status': 'failure', 'error': f'Failed to convert file {str(e)}'})



async def update_file_state(content: bytes, file_state: FileState) -> FileState:
    try: 
        old_file_name = file_state['metadata']['file_name']
        new_ext = file_state['conversion']['conversion']
        new_file_name = update_file_name(old_file_name, new_ext)
        # upload file content to tmp
        await create_file(new_file_name, content)
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
