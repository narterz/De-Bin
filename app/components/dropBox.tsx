"use client";

import { FaFileArrowUp } from "react-icons/fa6";
import { IoIosImages } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";
import {  useRef, ChangeEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { processFile, uploadFile, removeFile } from "../lib/reducers/processFiles";
import { validateSelectedFiles, serializeFile } from "../utils/fileValidation";
import { UploadedFile } from "../utils/types";

export default function DropBox() {
  const dispatch = useAppDispatch();
  const inputFile = useRef<HTMLInputElement>(null);

  const files = useAppSelector(processFile).uploadedFiles

  const handleFileUpload = ( e: ChangeEvent<HTMLInputElement> ) => {
    let files: FileList | null = e.target.files;
    if(!files) return;
    Promise.all(
      [...files].map(async file => {
        const serializedFile = await serializeFile(file)
        dispatch(uploadFile({
          file: serializedFile,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: "idle"
        }))
      }))
  }

  const handleDropBoxBtn = () => {
    if(files.length > 0){
      /* 
        Iterate over each file in files:
          change status to loading

      */

    } else {
      inputFile.current?.click();
    }
  }

  const shortenFileSize = (file: UploadedFile): string => {
    const fileExtension =  file.fileName.substring(file.fileName.lastIndexOf('.'));
    const fileNameShort = file.fileName.substring(0, 13)
    return `${fileNameShort}... ${fileExtension}`
  }

  useEffect(() => {
    // Open loadingModal if the status of any file is 'loading'
    // Close the loadingModal if the status of all files != 'loading
    // Deploy toast of error if the status of any file is 'error'
  },[])

  return (
    <div className="w-4/6 h-3/4 flex flex-col items-center justify-evenly border-dashed border-4 border-black bg-accent">
      <div className="dropbox-rows">
        <IoIosImages size={80} className="text-background" />
        <h3>Drag, drop, or select your files here</h3>
      </div>
      <div className="dropbox-rows">
        <input 
          type="file"
          ref={inputFile}
          multiple
          onChange={handleFileUpload}
          id="dropFileInput"
          className="hidden"
        />
        <Button className="cursor-pointer" onClick={() => inputFile.current?.click()}>
          <Files className="text-accent cursor-pointer" /> {files.length > 0 ? "Convert" : "Choose Files"}
        </Button>
        <div className="w-full h-1/4 flex items-center justify-evenly">
          { files.length > 0 
            ? files.map((file) => (
              <div className="dropbox-file flex flex-row items-center justify-evenly h-full w-1/3" key={file.fileName}>
                <MdCancel className="icon hover-text" size={30} onClick={() => dispatch(removeFile(file.fileName))}/>
                <p>{shortenFileSize(file)}</p>
              </div>
            ))
            : <small>See help to view all acceptable files.</small>
          }
        </div>
      </div>
    </div>
  );
}
