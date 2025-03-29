import Header from "./components/Header";
import DropBox from "./components/dropBox";

export default function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between">
      <header className="w-full h-[12%] position-fixed top-0 left-0 bg-background">
        <Header />
      </header>
      <div className="w-full h-1/4 bg-foreground flex items-center justify-center">
        <div className="flex h-5/6 w-3/6 flex-col items-center justify-around p-4">
          <h1 className="text-accent font-bold">Decompress your file</h1>
          <p className="text-black w-4/6 text-center">Tired of going to multiple shady file formatting websites, use our universal compressor to compress a wide variety of files.</p>
        </div>
      </div>
      <div className="w-full h-[60%] flex items-center justify-center bg-background">
        <DropBox />
      </div>
    </div>
  );
}
