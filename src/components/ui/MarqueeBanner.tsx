import React from "react";

const messages = [
  "NO ARTIFICIAL FLAVOURS ","•",
  "NO SUGAR ADDED ","•",
  "TOTALLY ORGANIC ","•",
  "FRESH JUICES EVERYDAY ","•",
];

const MarqueeBanner = () => {
  return (
    <div className="overflow-hidden bg-pink-600 text-white whitespace-nowrap py-2 shadow-pink-800">
      <div className="flex animate-scroll">
        {[...messages, ...messages].map((text, i) => (
          <span key={i} className="mx-8 text-lg font-semibold">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
