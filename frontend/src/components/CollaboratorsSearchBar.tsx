import { IoIosSearch } from "react-icons/io";

interface CollaboratorsSearchBarProps {
  onSearch: (term: string) => void;
}

const CollaboratorsSearchBar = ({ onSearch }: CollaboratorsSearchBarProps) => {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white">
        <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
        <input
          type="text"
          placeholder="Buscar por colaboradores"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CollaboratorsSearchBar;
