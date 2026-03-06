"use client";

import { SearchBar } from "@/components/SearchBar";

export default function TestSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Symbol Search Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Search for Stocks
          </h2>
          <SearchBar
            placeholder="Try searching for AAPL, TSLA, MSFT..."
            onSelect={(symbol) => {
              console.log("Selected symbol:", symbol);
            }}
          />
        </div>
      </div>
    </div>
  );
}
