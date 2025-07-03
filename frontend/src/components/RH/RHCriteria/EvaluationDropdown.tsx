import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface Criterion {
    id: number;
    name: string;
    displayName: string;
    generalDescription: string;
    weight: number;
}

interface EvaluationDropdownProps {
    availableCriteria: Criterion[];
    onSelect: (criterion: Criterion) => void;
    placeholder?: string;
    disabled?: boolean;
}

function EvaluationDropdown({ availableCriteria, onSelect, placeholder = "Selecionar critério", disabled = false }: EvaluationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCriteria = availableCriteria.filter(criterion =>
        criterion.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        criterion.generalDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (criterion: Criterion) => {
        onSelect(criterion);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-[#08605F] ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span className="block truncate text-sm text-gray-900">
                    {placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {isOpen ? <FaChevronUp className="h-4 w-4 text-gray-400" /> : <FaChevronDown className="h-4 w-4 text-gray-400" />}
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-[#08605F]"
                            placeholder="Buscar critério..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    {filteredCriteria.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Nenhum critério encontrado
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredCriteria.map((criterion) => (
                                <li key={criterion.id}>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        onClick={() => handleSelect(criterion)}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {criterion.displayName}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {criterion.generalDescription}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default EvaluationDropdown; 