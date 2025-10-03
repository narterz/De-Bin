from flask import Flask, jsonify, request
from flask_cors import CORS
from models import FileMetadata, FileConversion, FileStatus, FileState
from utils.excel_conversion import convert_xlsb_to_xlsx, convert_xlsx_to_xlsb
from dataclasses import asdict


app = Flask(__name__)
CORS(app)


@app.route("/api/decompressXlsb", method=['POST'])
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

        converted_file = convert_xlsb_to_xlsx(file_state)
        return jsonify(asdict(converted_file)), 200

    except ValueError as e:
        return jsonify({'status': 'failure', 'error': f'Incoming request was not valid JSON: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'An unexpected error occurred: {str(e)}'}), 500


@app.route("api/compressXlsx", method=['POST'])
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
        
        converted_file = convert_xlsx_to_xlsb(file_state)
        return jsonify(asdict(converted_file)), 200

    except ValueError as e:
        return jsonify({'status': 'failure', 'error': f'Incoming request was not valid JSON: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'status': 'failure', 'error': f'An unexpected error occurred: {str(e)}'}), 500


@app.route("api/convertToCsv", method=['POST'])
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

    # For development mode only
    app.run(debug=True, port=8080)

    # For production mode only
    # app.run(debug=False, port=8080)
