"use client";

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 px-4 w-full`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-[#09090b] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(56,200,241,0.1)] border border-white/10 overflow-hidden mr-4 mt-0.5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#38c8f1]/10 to-transparent"></div>
          <Image src="/rsmk.svg" alt="RSMK Logo" width={20} height={20} className="object-contain relative z-10" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#27272a] text-[#f4f4f5] rounded-tr-sm border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            : "bg-[#09090b]/80 border border-white/5 text-[#e4e4e7] rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap font-normal">{content}</p>
        ) : (
          <div className="markdown-body font-light text-[15px]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
