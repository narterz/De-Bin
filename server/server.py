from flask import Flask, jsonify, request
from flask_cors import CORS
from models import FileMetadata, FileConversion, FileStatus, FileState
from utils.excel_conversion import  xlsb_to_xlsx, xlsx_to_xlsb
from dataclasses import asdict
from dotenv import load_dotenv

import os
import logging


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "/tmp/"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

load_dotenv()

# Returns updated FileStatus
@app.route("api/upload", methods=['POST'])
def save_file() -> FileStatus:
    file_status: FileStatus = {
        "status": "loading",
        "error": ""    
    }
    try:
        if 'file' not in request.files:
            raise FileNotFoundError("No file part in the request")
        uploaded_file = request.files['file']
        file_id = request.form.get('id')
        file_name = request.form.get('file_name')
        tmp_file_name = f"{file_id}_{file_name}"
        tmp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], tmp_file_name)
        
        uploaded_file.save(tmp_file_path)
        
        file_status['status'] = "success"
        app.logger.info("Successfully added file to /tmp folder")
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


@app.route("api/compressXlsx", methods=['POST'])
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


@app.route("api/convertToCsv", methods=['POST'])
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
    env = os.environ.get("FLASK_ENV", "production")
    port = os.environ.get("PORT", 8081)
    
    debug_mode = env == "development"
        
    app.run(debug=debug_mode, port=port)
