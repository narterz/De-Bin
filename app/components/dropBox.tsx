"use client";

import { IoIosImages } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";
import {  useRef, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { uploadFile, removeFile, setError } from "../lib/reducers/processFiles";
import { openDialog } from "../lib/reducers/appController";
import { validateSelectedFiles, serializeFile } from "../utils/fileValidation";
import { processFile } from "../lib/selectors";
import SelectedFiles from "./SelectedFiles";
import { v4 as uuidv4 } from 'uuid';

export default function DropBox() {
  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).uploadedFiles;

  const handleFileUpload = ( e: ChangeEvent<HTMLInputElement> ) => {
    let files: FileList | null = e.target.files;
    if(!files) return;
    if(files.length > 3){
      console.debug(`File quantity of ${files.length} exceeded 3.`);
      dispatch(openDialog({
        header: 'Error: too many files',
        body: "De-bin only allows up to 3 files at a time. Please try again"
      }))
    }
    Promise.all(
      [...files].map(async file => {
        const serializedFile = await serializeFile(file)
        dispatch(uploadFile({
          file: serializedFile,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: "idle",
          id: uuidv4()
        }))
      }))
  }

  const handleDropBoxBtn = () => {
    if(files.length > 0){
      const allValidatedFiles = validateSelectedFiles(files);
      for(let i = 0; i < allValidatedFiles.length; i++){
        const failedFile = allValidatedFiles[i];
        dispatch(setError({
          id: failedFile.id,
          status: failedFile.status,
          error: failedFile.error
        }))
      }

    } else {
      inputFile.current?.click();
    }
  }

  const dropBoxColor = files.length < 1 ? "accent" : "foreground" 
  const dropBoxRowClassName = files.length < 1 ? "dropbox-rows-no-files" : "dropbox-rows-files"

  return (
    <div className={`w-4/6 h-3/4 flex flex-col items-center justify-evenly border-dashed border-4 border-black bg-${dropBoxColor}`} id="dropBox">

      <div className={files.length < 1 ? "dropbox-rows-no-files display-none-transition" : "hidden"}>
        <IoIosImages size={80} className="text-background" />
        <h3>Drag, drop, or select your files here</h3>
      </div>

      <div className={`display-none-transition ${`files.length < 1 ? dropBoxRowClassName : "w-3/4 flex-center-evenly" `}`}>
        <input 
          type="file"
          ref={inputFile}
          multiple
          onChange={handleFileUpload}
          id="dropFileInput"
          className="hidden"
        />
        <div className="w-full h-1/4 flex items-center justify-evenly border border-red-500">
          { files.length > 0 
            ? files.map((file) => (
              <SelectedFiles file={file} key={`selcted-file-${file.fileName}`}/>
            ))
            : <small>See help to view all acceptable files.</small>
          }
        </div>
      </div>

      <div className={`display-none-transition  ${`files.length < 1 ? dropBoxRowClassName : "w-1/4 flex-center-evenly" `}`}>
        <Button className="cursor-pointer" onClick={() => inputFile.current?.click()}>
          <Files className="text-accent cursor-pointer" /> {files.length > 0 ? "Convert" : "Choose Files"}
        </Button>
      </div>

    </div>
  );
}
