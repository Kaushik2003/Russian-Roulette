const Button = ({ children, onClick, disabled, className, ...props }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`game-button transition-all 0.2s ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;