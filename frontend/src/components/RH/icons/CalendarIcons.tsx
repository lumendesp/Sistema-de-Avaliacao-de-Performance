// src/components/icons/CustomCalendarIcon.tsx
import React from 'react';

// A interface define que nosso ícone pode receber as mesmas props que um SVG, como 'className'
interface IconProps extends React.SVGProps<SVGSVGElement> { }

const CustomCalendarIcon: React.FC<IconProps> = (props) => {
    return (
        // Cole o seu código SVG aqui e adicione a prop 'props' ao elemento <svg>
        <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* O resto do seu código SVG virá aqui. Exemplo: */}
            <path d="M14.3335 3.5835V10.7502" stroke="#419958" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M28.6665 3.5835V10.7502" stroke="#419958" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M37.625 30.4582V10.7498C37.625 9.79948 37.2475 8.88804 36.5755 8.21604C35.9035 7.54403 34.992 7.1665 34.0417 7.1665H8.95833C8.00797 7.1665 7.09654 7.54403 6.42453 8.21604C5.75253 8.88804 5.375 9.79948 5.375 10.7498V35.8332C5.375 36.7835 5.75253 37.695 6.42453 38.367C7.09654 39.039 8.00797 39.4165 8.95833 39.4165H28.6667L37.625 30.4582Z" stroke="#419958" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.375 17.9165H37.625" stroke="#419958" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M26.875 39.4165V32.2498C26.875 31.2995 27.2525 30.388 27.9245 29.716C28.5965 29.044 29.508 28.6665 30.4583 28.6665H37.625" stroke="#419958" stroke-width="3.58333" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export default CustomCalendarIcon;
