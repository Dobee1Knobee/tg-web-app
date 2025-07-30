import {useState} from "react";

const buttonStyles = {
    base: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        backgroundColor: '#f8f9fa', // Светло-серый изначально
        color: '#495057', // Темно-серый текст
    },
    icon: {
        fontSize: '18px',
    }
};


const SimpleButton = ({ onClick, hoverColor, icon, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            style={{
                ...buttonStyles.base,
                backgroundColor: isHovered ? hoverColor : '#f8f9fa',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <i className={icon} style={buttonStyles.icon}></i>
            {children}
        </button>
    );
};
export default SimpleButton;