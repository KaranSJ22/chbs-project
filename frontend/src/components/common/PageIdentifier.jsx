import React from "react";

const PageIdentifier = ({ screenId, screenName }) => {
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200 py-1">
      <div className="container mx-auto px-6">
        <span className="inline-block bg-gray-800 text-white text-xs font-mono px-2 py-0.5 rounded opacity-90">
          <span className="text-yellow-400 font-bold">ID:</span> {screenId}
          {screenName && <span className="ml-2 text-gray-300">| {screenName}</span>}
        </span>
      </div>
    </div>
  );
};

export default PageIdentifier;