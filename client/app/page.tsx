"use client"

import Header from "./components/Header";
import DropBox from "./components/dropBox";
import Modal from "./components/Modal";
import { FaGithub } from "react-icons/fa";

export default function Home() {

  const githubLink = "https://github.com/narterz/De-Bin"

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between relative">
      <Modal />
      <header className="w-full h-[12%] position-fixed top-0 left-0 bg-background">
        <Header />
      </header>
      <div className="w-full h-1/4 bg-foreground flex-center">
        <div className="subheader flex-center-around h-5/6">
          <h1 className="text-accent flex-center font-bold w-full">Decompress your file</h1>
          <p className="subheader-text-sm text-black text-center w-full">Tired of going to multiple shady ad filled file formatting websites? Use our free open source file conversion tool to quickly convert a file of your choice.</p>
        </div>
      </div>
      <div className="w-full h-[60%] flex items-center justify-center bg-background">
        <DropBox />
      </div>
      <a className="github-logo rounded" href={githubLink} target="_blank" rel="noopener noreferrer">
        <FaGithub id="github-logo" className="text-white h-3/4 w-3/4"/>
      </a>
    </div>
  );
}
