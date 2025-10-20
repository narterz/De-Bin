from flask import Flask, jsonify, request
from flask_cors import CORS
from dataclasses import asdict
from dotenv import load_dotenv

from models import FileMetadata, FileConversion, FileStatus, FileState
from utils.excel_conversion import xlsb_to_xlsx, xlsx_to_xlsb
from utils.handle_dir import clean_tmp, remove_file_from_tmp, create_tmp

import os


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


@app.route("/api/decompressXlsb", methods=['POST'])
def xlsbToXlsx(file_state: FileState) -> FileState:
    try:
        if not request.is_json():
            raise ValueError

        frontend_request = request.get_json()

        file_state = FileState(
            metadata=FileMetadata(**frontend_request["metadata"]),
            status=FileStatus(**frontend_request["status"]),
            conversion=FileConversion(**frontend_request["conversion"])
        )
        

        converted_file = xlsb_to_xlsx(file_state)
        return jsonify(asdict(converted_file)), 200

    except ValueError as e:
        return jsonify({'status': 'failure', 'error': f'Incoming request was not valid JSON: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'An unexpected error occurred: {str(e)}'}), 500


@app.route("/api/compressXlsx", methods=['POST'])
def xlsxToXlsb():
    try:
        if not request.is_json():
            raise ValueError

        frontend_request = request.get_json()

        file_state = FileState(
            metadata=FileMetadata(**frontend_request["metadata"]),
            status=FileStatus(**frontend_request["status"]),
            conversion=FileConversion(**frontend_request["conversion"])
        )
        
        converted_file = xlsx_to_xlsb(file_state)
        return jsonify(asdict(converted_file)), 200

    except ValueError as e:
        return jsonify({'status': 'failure', 'error': f'Incoming request was not valid JSON: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'An unexpected error occurred: {str(e)}'}), 500


@app.route("/api/convertToCsv", methods=['POST'])
def excelToCSV():
    try:
        if not request.is_json():
            raise ValueError

        # Return xlsx file as FileState from module

    except ValueError as e:
        return jsonify({'status': 'failure', 'error': f'Incoming request was not valid JSON: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'An unexpected error occurred: {str(e)}'}), 500


if __name__ == "__main__":
    # To run in development mode change FLASK_ENV to development in server env file
    env = os.environ.get("FLASK_ENV", "development")
    port = os.environ.get("PORT", 8081)
    
    debug_mode = env == "development"
        
    app.run(debug=debug_mode, port=port)
