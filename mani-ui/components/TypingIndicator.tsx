import { motion } from "framer-motion";
import Image from "next/image";

export default function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="flex justify-start mb-6 px-4"
    >
      <div className="w-9 h-9 rounded-xl bg-[#09090b] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(56,200,241,0.1)] border border-white/10 overflow-hidden mr-4 mt-0.5 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38c8f1]/10 to-transparent"></div>
        <Image src="/rsmk.svg" alt="RSMK Logo" width={20} height={20} className="object-contain relative z-10" />
      </div>
      <div className="bg-[#09090b]/80 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-[48px] backdrop-blur-md">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa] animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa] animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa] animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
    </motion.div>
  );
}
