interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
}

function ToggleSwitch({ isToggled, onToggle }: ToggleSwitchProps) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={isToggled}
                onChange={onToggle}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-[#08605F] peer-checked:bg-[#08605F]">
                <div
                    className={`absolute top-0.5 left-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-300 ease-in-out ${isToggled ? 'transform translate-x-full' : ''
                        }`}
                ></div>
            </div>
        </label>
    );
}

export default ToggleSwitch;
