import { forwardRef } from "react";
import { IoCalendarClearOutline } from "react-icons/io5";

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange }, ref) => {
    return (
      <div
        className="w-full relative"
        onClick={onClick}
      >
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder="Selecione uma data"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent pr-10 cursor-pointer"
          readOnly
        />
        <IoCalendarClearOutline
          size={20}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    );
  }
);
