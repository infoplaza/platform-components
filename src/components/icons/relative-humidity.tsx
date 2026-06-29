import * as React from "react";
const RelativeHumidityIcon = ({ className }: { className?: string }) => (
    <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect width={24} height={24} fill="transparent" />
        <path
            d="M12.6503 1.18864C12.4583 1.0657 12.2318 1 12 1C11.7682 1 11.5417 1.0657 11.3497 1.18864C11.0013 1.40863 3 6.68823 3 14.4756C3 16.7364 3.94821 18.9046 5.63604 20.5033C7.32387 22.1019 9.61305 23 12 23C14.3869 23 16.6761 22.1019 18.364 20.5033C20.0518 18.9046 21 16.7364 21 14.4756C21 6.55624 12.9871 1.39763 12.6503 1.18864ZM12 20.8002C10.23 20.7973 8.53334 20.13 7.28174 18.9445C6.03015 17.7591 5.32565 16.1521 5.32258 14.4756C5.32258 8.97606 10.2116 4.82937 12 3.47647C13.8 4.80737 18.6774 8.97606 18.6774 14.4756C18.6743 16.1521 17.9699 17.7591 16.7183 18.9445C15.4667 20.13 13.77 20.7973 12 20.8002Z"
            fill="currentColor"
        />
        <circle cx="9.49346" cy="11.0024" r="1.63857" fill="currentColor" />
        <circle cx="14.4092" cy="15.9181" r="1.63857" fill="currentColor" />
        <rect
            x="15.0414"
            y="9"
            width="1.63857"
            height="11.0894"
            rx="0.819283"
            transform="rotate(45 15.0414 9)"
            fill="currentColor"
        />
    </svg>
);
export default RelativeHumidityIcon;
