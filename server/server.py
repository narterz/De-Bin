from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import mimetypes
import os
import json
from tempfile import TemporaryDirectory
import base64

from models import FileStatus, FileState

from utils.decorators       import log_func, log_route
from utils.handle_dir       import remove_file_dir, create_file, update_file_size
from utils.excel_conversion import convert_to_excel
from utils.pdf_conversion   import convert_to_pdf
from utils.csv_conversion   import convert_to_csv
from utils.jpg_conversion   import convert_to_jpg
from utils.png_conversion   import convert_to_png
from utils.txt_conversion   import convert_to_txt
from utils.zip_conversion   import convert_to_zip

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
UPLOAD_FOLDER = "/tmp/"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
load_dotenv()
print(f"PORT from env: {os.environ.get('PORT')}")


tempdir_obj = TemporaryDirectory(prefix="d-bin_")
temp_dir = tempdir_obj.name
app.logger.info(f"Temp directory created: {temp_dir}")

@app.route('/')
@log_route
def index():
    return "Backend is running", 200

 #TODO: Handle unique id for files.
@app.route("/api/upload", methods=['POST'])
@log_route
def save_file() -> FileStatus:
    if 'file' not in request.files:
        app.logger.error("save_file: File not found in request")
        return jsonify({'status': 'failure', 'error': 'No file part in the request'}), 400
    
    uploaded_file = request.files['file']
    # file_id = request.form.get('id')
    file_name = request.form.get('file_name')
    if not file_name:
        return jsonify({'status': 'failure', 'error': 'Missing id or file_name'}), 400
    
    file_path = f"{temp_dir}/{file_name}"
    create_tmp_file = create_file(temp_dir, file_path, uploaded_file)
    if create_tmp_file['status'] == 'failure':
        app.logger.error("save_file: Failed to save file: %s", create_tmp_file['error'])
        return jsonify(create_tmp_file), 500

    app.logger.info("save_file: Successfully added file %s to /tmp", file_name)
    return jsonify({'status': 'success', 'error': ''}), 200      

@app.route('/api/removeFile', methods=['POST'])
@log_route
def remove_file() -> FileStatus:
    # file_id = request.form.get('id')
    file_name = request.form.get('file_name')
    if not file_name:
        app.logger.error("remove_file_dir: file not found in request")
        return jsonify({'status': 'failure', 'error': 'No file arg in the request'}), 400
    
    full_file_name = f"{file_name}"
    remove_file_response = remove_file_dir(temp_dir, full_file_name)
    if remove_file_response['status'] == 'failure':
        app.logger.error("remove_file_dir: Failed to remove file: %s", remove_file_response['error'])
        return jsonify(remove_file_response), 500
    
    app.logger.info("remove_file_dir: Successfully removed file %s", file_name)
    return jsonify(remove_file_response), 200

@app.route('/api/convertFile', methods=['POST'])
@log_route
def convert_file() -> FileState | FileStatus:
    file_state_json = request.form.get('fileState')
    if not file_state_json:
        app.logger.error("convert_file: Request missing arg FileState")
        return jsonify({'status': 'failure', 'error': 'FileState arg not present in request'})
    
    # FileState is returned upon success FileStatus upon failure
    file_state_dict = json.loads(file_state_json)
    file_status_response = file_state_dict['fileStatus']
    
    file_name = file_state_dict['metadata']['fileName']
    current_extension = file_state_dict['metadata']['fileExtension']
    conversion = file_state_dict['fileConversions']['conversion']

    file_path = f"{temp_dir}/{file_name}"
    if not os.path.exists(file_path):
        app.logger.error("convert_file: Could not find file %s in /tmp", file_name)
        file_status_response['status'] = 'failure'
        file_status_response['error'] = 'Server could not find file'
        return jsonify(file_status_response), 404
    
    conversion_dict = {
        "pdf" :  convert_to_pdf,
        "txt" :  convert_to_txt,
        "csv" :  convert_to_csv,
        "jpg" :  convert_to_jpg,
        "jpeg":  convert_to_jpg,
        "png" :  convert_to_png,
        "xlsx":  convert_to_excel,
        "xlsb":  convert_to_excel,
        "zip" :  convert_to_zip
    }
    
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            conversion_key = conversion.lstrip('.').lower()            
            func = conversion_dict.get(conversion_key)
            if func:
                app.logger.debug(f"Calling func {func.__name__}")
                converted_file = func(content, current_extension)
                
                # Error handling of file conversion from conversion modules
                if isinstance(converted_file, dict) and converted_file.get('status') == 'failure':
                    file_status_response = conversion_dict
                    return jsonify(file_status_response), 400
                    
                
                app.logger.debug(f"Conversion successful, content length: {len(converted_file)} bytes")
                new_file_state = update_file_state(converted_file, file_state_dict)
            
                # Error handling of failed fileState updating
                if new_file_state['fileStatus']['status'] == 'failure':
                    file_status_response = new_file_state['fileStatus']
                    return jsonify(file_status_response), 400

                app.logger.info(f"convert_file: Successfully converted file {file_name} from {current_extension} to {conversion}")
                return jsonify(new_file_state), 200
            else:
                app.logger.error(f"Conversion function {func} does not exist")
                raise Exception(f"Unsupported conversion type: {conversion}")
    
    except Exception as e:
        app.logger.error(f"convert_file: Failed to convert file {file_name} from {current_extension} to {conversion} error: {str(e)}")
        file_status_response['status'] = 'failure'
        file_status_response['error'] = f'Server error has occurred: {str(e)}'
        return jsonify(file_status_response), 500


@log_func
def update_file_state(content: bytes, file_state_dict: FileState) -> FileState:
    # Update the file_name
    old_file_name = file_state_dict['metadata']['fileName']
    old_ext_index = old_file_name.find('.')
    new_ext = file_state_dict['fileConversions']['conversion']
    new_file_name = old_file_name[:old_ext_index] + f'{new_ext}'
    app.logger.debug(f"New file name {new_file_name}")
    
    # Remove old file from directory
    remove_old_file = remove_file_dir(temp_dir, old_file_name)
    if remove_old_file['status'] == 'failure':
        app.logger.error(f"Error removing old file {old_file_name}, {remove_old_file['error']}")
        file_state_dict['status'] = remove_old_file
        return file_state_dict
    app.logger.debug(f"Successfully removed old file {old_file_name}")
    
    # Insert new file to directory
    upload_converted_file = create_file(temp_dir, new_file_name, content)
    if upload_converted_file['status'] == 'failure':
        app.logger.error(f"Failed to insert new file {new_file_name} into directory")
        file_state_dict['status'] = upload_converted_file
        return file_state_dict
    app.logger.debug(f"Successfully inserted new file {new_file_name} to directory")
    
    # update file size
    new_file_path = f'{temp_dir}/{new_file_name}'
    new_file_size = update_file_size(new_file_path)
    if not isinstance(new_file_size, int):
        app.logger.error(f"Failed to get update size of new file {new_file_name}")
        file_state_dict['status'] = new_file_size
        return file_state_dict
    app.logger.debug(f"Successfully updated file size of new file {new_file_name}")
    
    # update file type
    mime_type = mimetypes.guess_type(new_file_path)
    updated_file_type = mime_type if mime_type else "application/octet-stream"
    
    # Assemble new file state
    new_file_state: FileState = {
        "metadata": {
            "file": base64.b64encode(content).decode('utf-8'),
            "fileName": new_file_name, 
            "fileSize": new_file_size,
            "fileType": updated_file_type,
            "fileNameShortened": file_state_dict['metadata']['fileNameShortened'],
            "fileExtension": new_ext,
            "id": file_state_dict['metadata']['id'] 
        },
        "fileStatus": file_state_dict['fileStatus'],
        "fileConversions": file_state_dict['fileConversions']
    }
    
    app.logger.debug(f"[update_file_state]: Successfully updated file state")
    return new_file_state
    
if __name__ == "__main__":
    # To run in development mode change FLASK_ENV to development in server env file
    env = os.environ.get("FLASK_ENV", "development")
    port = os.environ.get("PORT", 8001)
    print(f"Using port: {port}")
    
    debug_mode = env == "development"
        
    app.run(debug=debug_mode, port=port)
