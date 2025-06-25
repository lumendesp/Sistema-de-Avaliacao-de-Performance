import { IoIosSearch } from "react-icons/io";
import React from 'react';

interface CollaboratorsSearchBarProps {
    searchTerm: string;
    onSearchChange: (newTerm: string) => void;
}

const CollaboratorsSearchBar: React.FC<CollaboratorsSearchBarProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50 relative">
            <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
            <input
                type="text"
                placeholder="Buscar por colaboradores"
                className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
};

export default CollaboratorsSearchBar;