"use client";

import { IoIosImages } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Files, X } from "lucide-react";
import {  useRef, ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { uploadFile, removeFile, setError, clearAllFiles } from "../lib/reducers/processFiles";
import { openDialog } from "../lib/reducers/appController";
import { validateSelectedFiles, serializeFile } from "../utils/fileValidation";
import { processFile } from "../lib/selectors";
import SelectedFiles from "./SelectedFiles";
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from "../utils/types";

export default function DropBox() {
  const [areSelectedFiles, setAreSelectedFiles] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).uploadedFiles;

  const handleFileUpload = ( e: ChangeEvent<HTMLInputElement> ) => {
    let files: FileList | null = e.target.files;
    console.debug(`Inserting files ${files}`)
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

  const handleClearAll = () => {
    console.debug("Removing all files")
    dispatch(clearAllFiles())
    if (inputFile.current) {
        inputFile.current.value = "";
    }
  }

  const handleRemoveFile = (fileName: UploadedFile['fileName']) => {
    console.debug("Removing file: " + fileName)
    dispatch(removeFile(fileName))
    if (inputFile.current) {
      inputFile.current.value = "";
    }
  }

  useEffect(() => {
    console.log("selected files is: " + areSelectedFiles)
    if(files.length > 0) {
      setAreSelectedFiles(true)
    } else setAreSelectedFiles(false)
  },[files])

  return (
    <div className={`flex flex-col items-center border-dashed border-4 border-black bg-accent ${areSelectedFiles ? "selected" : ""}`} id="dropBox">

      <div className={`flex-row justify-evenly items-center ${areSelectedFiles ? "hidden" : "flex"}` } id="dropBox-header">
        <IoIosImages size={80} className="text-background" />
        <h2 className="text-black">Drag, drop, or select your files here</h2>
      </div>

      <div className={`display-none-transition text-center flex-center-evenly  ${areSelectedFiles ? "selected" : ""}`} id="dropBox-body">
        <input 
          type="file"
          ref={inputFile}
          multiple
          onChange={handleFileUpload}
          id="dropFileInput"
          className="hidden"
        />
        { files.length > 0 
          ? files.map((file) => (
            <SelectedFiles file={file} onRemoveFile={handleRemoveFile} key={`selected-file-${file.fileName}`}/>
          ))
          : <div className="h-full w-full flex flex-col items-center justify-around m-5">
                <p>Drag and drop your files here or press the button below to select files</p>
                <small>See help to view all acceptable files.</small>
            </div>
        }
      </div>

      <div className="display-none-transition w-1/2 h-1/5 flex flex-row justify-evenly items-center mb-5" id="dropBox-footer">
        <Button onClick={() => inputFile.current?.click()} className="dropBox-btns">
          <Files className="dropbox-icons" /> {files.length > 0 ? "Convert" : "Choose Files"}
        </Button>
        <Button className={`dropBox-btns ${areSelectedFiles ? "flex" : "hidden"}`} onClick={handleClearAll}>
          <X className="dropbox-icons"/> Clear all
        </Button>
      </div>

    </div>
  );
}
