interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
    loading?: boolean;
}

function ToggleSwitch({ isToggled, onToggle, loading = false }: ToggleSwitchProps) {
    return (
        <label className={`relative inline-flex items-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                checked={isToggled}
                onChange={onToggle}
                disabled={loading}
                className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-[#08605F] peer-checked:bg-[#08605F] ${
                loading ? 'bg-gray-300 animate-pulse' : 'bg-gray-200'
            }`}>
                <div
                    className={`absolute top-0.5 left-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-300 ease-in-out ${
                        isToggled ? 'transform translate-x-full' : ''
                    } ${loading ? 'opacity-70' : ''}`}
                ></div>
            </div>
        </label>
    );
}

export default ToggleSwitch;
