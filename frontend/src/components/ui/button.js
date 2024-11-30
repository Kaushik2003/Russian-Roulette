// components/ui/button.js
import React from 'react';

export const Button = ({ id, className, children, onClick, disabled }) => {
    return (
        <button
            id={id}
            className={`game-button ${className} px-4 py-2 rounded pixel-border`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
