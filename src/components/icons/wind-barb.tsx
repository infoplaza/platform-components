import * as React from "react";
const WindBarbIcon = ({ className }: { className?: string }) => (
    <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g clipPath="url(#clip0_wind_barb)">
            <rect width={24} height={24} fill="transparent" />
            <path
                d="M21 2.70151L16.0563 2.70154L5.48292 19.9913"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                fill="transparent"
            />
            <path
                d="M20 6.36055L14 6.36055"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
            />
            <path
                d="M16.0112 9.85783L12 9.85783"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
            />
            <circle
                cx="5.48289"
                cy="19.9913"
                r="2.53332"
                transform="rotate(121.448 5.48289 19.9913)"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="clip0_wind_barb">
                <rect width={24} height={24} fill="transparent" />
            </clipPath>
        </defs>
    </svg>
);
export default WindBarbIcon;
