// src/components/icons/CustomCalendarIcon.tsx
import React from 'react';

// A interface define que nosso ícone pode receber as mesmas props que um SVG, como 'className'
interface IconProps extends React.SVGProps<SVGSVGElement> { }

const CustomDocumentIcon: React.FC<IconProps> = (props) => {
    return (
        // Cole o seu código SVG aqui e adicione a prop 'props' ao elemento <svg>
        <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M27.7498 7.7085L24.0283 3.98691C23.4502 3.40864 22.666 3.08367 21.8483 3.0835H9.24984C8.43209 3.0835 7.64783 3.40835 7.06959 3.98658C6.49135 4.56482 6.1665 5.34908 6.1665 6.16683V30.8335C6.1665 31.6512 6.49135 32.4355 7.06959 33.0137C7.64783 33.592 8.43209 33.9168 9.24984 33.9168H27.7498C28.5676 33.9168 29.3518 33.592 29.9301 33.0137C30.5083 32.4355 30.8332 31.6512 30.8332 30.8335" stroke="#F33E3E" stroke-width="3.08333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M32.9575 19.4653C33.5716 18.8512 33.9167 18.0182 33.9167 17.1497C33.9167 16.2812 33.5716 15.4483 32.9575 14.8341C32.3434 14.22 31.5104 13.875 30.6419 13.875C29.7734 13.875 28.9405 14.22 28.3263 14.8341L22.1443 21.0193C21.7777 21.3856 21.5094 21.8385 21.3642 22.3359L20.0738 26.7605C20.0351 26.8931 20.0328 27.0338 20.0671 27.1676C20.1014 27.3015 20.171 27.4237 20.2687 27.5214C20.3665 27.6191 20.4886 27.6887 20.6225 27.723C20.7564 27.7573 20.897 27.755 21.0296 27.7163L25.4542 26.4259C25.9517 26.2807 26.4045 26.0124 26.7708 25.6459L32.9575 19.4653Z" stroke="#F33E3E" stroke-width="3.08333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.3335 27.75H13.8752" stroke="#F33E3E" stroke-width="3.08333" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export default CustomDocumentIcon;



