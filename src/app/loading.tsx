import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute w-24 h-24 rounded-full border-4 border-[#C5A059]/20 border-t-[#C5A059] animate-spin"></div>
          
          {/* Inner pulsating logo image */}
          <div className="animate-pulse flex items-center justify-center z-10">
            <Image 
              src="/logo.png" 
              alt="Ajo Circle Loading" 
              width={48} 
              height={48} 
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-[#0B3022] font-bold tracking-widest text-sm uppercase mt-4">Loading...</p>
      </div>
    </div>
  );
}
