from genericpath import isdir
import os
import shutil

def create_tmp(filename, file):
    dir_path = '/tmp'
    try:
        if not os.path.isdir(dir_path):
            os.mkdir(dir_path)
        tmp_file_path = os.path.join('/tmp', filename)
        file.save(tmp_file_path) 
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }

def clean_tmp(file_path):
    for file_name in os.listdir(file_path):
        tmp_path = os.path.join(file_path, file_name)
        try:
            if os.path.isfile(tmp_path) or os.path.isdir(tmp_path):
                shutil.rmtree(tmp_path)
        except Exception as e:
            return { 'status': 'failure', 'error': str(e) }
    return { 'status': 'success', 'error': '' }
        
def remove_file_from_tmp(file_path):
    try:
        os.remove(file_path)
        return { 'status': 'success', 'error': '' }
    except Exception as e:
        return { 'status': 'failure', 'error': str(e) }
    
    