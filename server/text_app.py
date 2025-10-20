import unittest
import json
import io
from server import app
import os


class FlaskUnitTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.file_state = {
            'id': '123',
            'file': (io.BytesIO(b"dummy file content"), 'testfile.txt'),
            'file_name': 'testfile.txt',
            'file_size': 0,
            'file_type': '',
            'file_name_shortened': '',
            'file_extension': ''
        }

    def clean_test(self):
        tmp_file_name = f"{self.file_state['id']}_{self.file_state['file_name']}"
        tmp_file_path = os.path.join("/tmp", tmp_file_name)
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)

    def test_file_upload(self):
        response = self.app.post(
            '/api/upload', data=self.file_state, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['status'], 'success')

    def test_remove_file(self):
        self.test_file_upload()
        file_data = {
            'id': self.file_state['id'],
            'file_name': self.file_state['file_name']
        }
        response = self.app.post(
            '/api/removeFile', data=file_data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        json_data = response.get_json()
        self.assertEqual(json_data['status'], 'success')

    def test_xlsbToXlsx(self):
        pass

    if __name__ == '__main__':

        # Test file uploading ( save_file() )
        suite = unittest.TestSuite()
        suite.addTest(FlaskUnitTest('test_file_upload'))
        runner = unittest.TextTestRunner()
        runner.run(suite)

        # Test removing file ( remove_file() )    # suite = unittest.TestSuite()
        # suite = unittest.TestSuite()
        # suite.addTest(FlaskUnitTest('test_remove_file'))
        # runner = unittest.TextTestRunner()
        # runner.run(suite)

        unittest.main()
