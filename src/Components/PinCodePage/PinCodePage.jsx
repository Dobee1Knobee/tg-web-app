import { useEffect, useState } from "react";
import { IoClose, IoBackspaceOutline } from "react-icons/io5";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from "../Header/Header";
import { useTelegram } from "../../hooks/useTelegram";
import { useUserByAt } from "../../hooks/findUserByAt";
import { checkPinCode } from "../../hooks/checkPinCode";
import { useNavigate } from "react-router-dom";

const PinCodePage = () => {
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useTelegram();
    const telegramUsername = user?.username || "devapi1";
    const userData = useUserByAt(telegramUsername);
    const navigate = useNavigate();

    // Стили в едином стиле с WelcomePage
    const pageStyles = {
        container: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
        },
        pinCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            marginTop: window.innerWidth < 768 ? '5vh' : '-4rem', // Телефон : Компьютер
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '380px',
            width: '100%',
            margin: '0 auto',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        subtitle: {
            fontSize: '14px',
            color: '#718096',
            textAlign: 'center',
            marginBottom: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        pinContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
        },
        pinInput: {
            width: '50px',
            height: '50px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: '600',
            background: 'white',
            transition: 'all 0.2s ease',
            outline: 'none',
        },
        pinInputFilled: {
            borderColor: '#4299e1',
            background: '#ebf8ff',
        },
        pinInputError: {
            borderColor: '#e53e3e',
            background: '#fed7d7',
        },
        pinInputSuccess: {
            borderColor: '#38a169',
            background: '#c6f6d5',
        },
        keypadContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
        },
        keypadRow: {
            display: 'flex',
            gap: '12px',
        },
        keypadButton: {
            width: '60px',
            height: '60px',
            border: 'none',
            borderRadius: '12px',
            background: '#f7fafc',
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        keypadButtonHover: {
            background: '#e2e8f0',
            transform: 'translateY(-1px)',
        },
        actionButton: {
            background: '#f56565',
            color: 'white',
        },
        actionButtonHover: {
            background: '#e53e3e',
        },
        warningButton: {
            background: '#ed8936',
            color: 'white',
        },
        warningButtonHover: {
            background: '#dd6b20',
        },
        enterButton: {
            width: '100%',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        enterButtonDisabled: {
            background: '#cbd5e0',
            cursor: 'not-allowed',
        },
        alertSuccess: {
            background: 'rgba(56, 161, 105, 0.1)',
            border: '1px solid rgba(56, 161, 105, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#2f855a',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
            fontWeight: '500',
        },
        alertError: {
            background: 'rgba(229, 62, 62, 0.1)',
            border: '1px solid rgba(229, 62, 62, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#c53030',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
            fontWeight: '500',
        },
        userInfo: {
            textAlign: 'center',
            fontSize: '12px',
            color: '#718096',
            marginTop: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }
    };

    const handleClick = (digit) => {
        if (pincode.length < 4) {
            setPincode(pincode + digit);
            setError('');
            setSuccessMessage('');
        } else {
            setError("PIN-код должен содержать 4 цифры");
        }
    };

    const handleDelete = () => {
        if (pincode.length > 0) {
            setPincode(pincode.slice(0, -1));
            setError('');
            setSuccessMessage('');
        }
    };

    const handleClear = () => {
        setPincode('');
        setError('');
        setSuccessMessage('');
    };

    const handleLoading = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const result = await checkPinCode(pincode.toString(), telegramUsername);

        if (result.success) {
            setSuccessMessage(result.message);
            setTimeout(() => {
                navigate('/welcomePage');
            }, 1500);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    // Обработка клавиатуры
    useEffect(() => {
        const handleKeyPress = (event) => {
            const key = event.key;

            // Цифры 0-9
            if (/^[0-9]$/.test(key)) {
                handleClick(key);
            }
            // Backspace
            else if (key === 'Backspace') {
                handleDelete();
            }
            // Enter
            else if (key === 'Enter' && pincode.length === 4) {
                handleLoading();
            }
            // Escape или Delete для очистки
            else if (key === 'Escape' || key === 'Delete') {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [pincode]);

    // Автоочистка ошибок
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const digitButtons = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    const isComplete = pincode.length === 4;

    // Компонент кнопки клавиатуры
    const KeypadButton = ({ children, onClick, variant = 'default', disabled = false }) => {
        const [isHovered, setIsHovered] = useState(false);

        let buttonStyle = { ...pageStyles.keypadButton };

        if (variant === 'action') {
            buttonStyle = { ...buttonStyle, ...pageStyles.actionButton };
            if (isHovered) buttonStyle = { ...buttonStyle, ...pageStyles.actionButtonHover };
        } else if (variant === 'warning') {
            buttonStyle = { ...buttonStyle, ...pageStyles.warningButton };
            if (isHovered) buttonStyle = { ...buttonStyle, ...pageStyles.warningButtonHover };
        } else if (isHovered && !disabled) {
            buttonStyle = { ...buttonStyle, ...pageStyles.keypadButtonHover };
        }

        if (disabled) {
            buttonStyle.opacity = 0.5;
            buttonStyle.cursor = 'not-allowed';
        }

        return (
            <button
                style={buttonStyle}
                onClick={onClick}
                disabled={disabled}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </button>
        );
    };

    return (
        <div style={pageStyles.container}>


            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <div style={pageStyles.pinCard}>
                    <div style={pageStyles.title}>
                        Enter PIN-code 🔐
                    </div>
                    <div style={pageStyles.subtitle}>
                        Enter your 4-digit PIN code to log in
                    </div>

                    {/* Сообщения об ошибках */}
                    {error && (
                        <div style={pageStyles.alertError}>
                            ❌ {error}
                        </div>
                    )}

                    {/* Сообщение об успехе */}
                    {successMessage && (
                        <div style={pageStyles.alertSuccess}>
                            ✅ {successMessage}
                        </div>
                    )}

                    {/* PIN поля */}
                    <div style={pageStyles.pinContainer}>
                        {[0, 1, 2, 3].map((index) => {
                            let inputStyle = { ...pageStyles.pinInput };

                            if (pincode[index]) {
                                inputStyle = { ...inputStyle, ...pageStyles.pinInputFilled };
                            }
                            if (error) {
                                inputStyle = { ...inputStyle, ...pageStyles.pinInputError };
                            }
                            if (successMessage) {
                                inputStyle = { ...inputStyle, ...pageStyles.pinInputSuccess };
                            }

                            return (
                                <input
                                    key={index}
                                    style={inputStyle}
                                    readOnly
                                    value={pincode[index] || ''}
                                />
                            );
                        })}
                    </div>

                    {/* Цифровая клавиатура */}
                    <div style={pageStyles.keypadContainer}>
                        {digitButtons.map((row, rowIndex) => (
                            <div key={rowIndex} style={pageStyles.keypadRow}>
                                {row.map((digit) => (
                                    <KeypadButton
                                        key={digit}
                                        onClick={() => handleClick(digit.toString())}
                                        disabled={isLoading}
                                    >
                                        {digit}
                                    </KeypadButton>
                                ))}
                            </div>
                        ))}

                        {/* Последний ряд */}
                        <div style={pageStyles.keypadRow}>
                            <KeypadButton
                                variant="action"
                                onClick={handleClear}
                                disabled={isLoading}
                            >
                                <IoClose size={20} />
                            </KeypadButton>

                            <KeypadButton
                                onClick={() => handleClick('0')}
                                disabled={isLoading}
                            >
                                0
                            </KeypadButton>

                            <KeypadButton
                                variant="warning"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                <IoBackspaceOutline size={20} />
                            </KeypadButton>
                        </div>
                    </div>

                    {/* Кнопка входа */}
                    {isComplete && (
                        <button
                            style={{
                                ...pageStyles.enterButton,
                                ...(isLoading ? pageStyles.enterButtonDisabled : {})
                            }}
                            onClick={handleLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="bi bi-arrow-clockwise" style={{
                                        marginRight: '8px',
                                        animation: 'spin 1s linear infinite'
                                    }}></i>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle" style={{ marginRight: '8px' }}></i>
                                    Enter
                                </>
                            )}
                        </button>
                    )}

                    {/* Информация о пользователе и подсказки */}
                    <div style={pageStyles.userInfo}>
                        Entered: {pincode.length}/4
                        {userData && (
                            <div style={{ marginTop: '4px' }}>
                                User: {telegramUsername}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PinCodePage;