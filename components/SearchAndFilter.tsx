'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  onSearch?: (search: string) => void;
}

export default function SearchAndFilter({ onSearch }: SearchAndFilterProps) {
  const [search, setSearch] = useState('');

  // Debounce search - tunggu 500ms setelah user berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(search);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]); // Hapus onSearch dari dependency untuk avoid infinite loop

  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" size={20} />
        <input
          type="text"
          placeholder="🔍 Cari sayuran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 sm:py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
