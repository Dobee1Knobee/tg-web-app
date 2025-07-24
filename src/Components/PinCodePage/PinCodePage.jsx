import { useEffect, useState } from "react";
import { IoClose, IoBackspaceOutline } from "react-icons/io5";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "../Header/Header";
import {useTelegram} from "../../hooks/useTelegram";
import {useUserByAt} from "../../hooks/findUserByAt";
import {checkPinCode} from "../../hooks/checkPinCode";
import {useNavigate} from "react-router-dom";

const PinCodePage = () => {
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useTelegram();
    const telegramUsername = user?.username || "devapi1";
    const userData = useUserByAt(telegramUsername);
    const navigate = useNavigate();

    const handleClick = (digit) => {
        if (pincode.length < 4) {
            setPincode(pincode + digit);
            setError('');
            setSuccessMessage(''); // Очищаем предыдущие сообщения
        } else {
            setError("PIN-код состоит из 4 цифр");
        }
    };

    const handleDelete = () => {
        if (pincode.length > 0) {
            setPincode(pincode.slice(0, -1));
            setError('');
            setSuccessMessage('');
        }
    };

    const handleLoading = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        console.log(pincode.toString());
        console.log(telegramUsername);
        const result = await checkPinCode(pincode.toString(), telegramUsername);

        if(result.success) {
            setSuccessMessage(result.message);
            setTimeout(() => {
                navigate('/welcomePage');
            }, 1500); // Убрал alert, увеличил время для показа сообщения
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setPincode('');
        setError('');
        setSuccessMessage('');
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Автоматическая проверка при вводе 4-й цифры (опционально)
    useEffect(() => {
        if (pincode.length === 4 && !isLoading) {
            // Можно включить автопроверку или оставить ручную
            // handleLoading();
        }
    }, [pincode]);

    const digitButtons = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    const isComplete = pincode.length === 4;

    return (
        <div className="vh-100 bg-light">
            <Header />

            <div className="container py-4 mt-3">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <h4 className="card-title mb-2">Введите PIN-код</h4>
                                    <p className="text-muted small mb-0">
                                        Введите 4-значный код для входа
                                    </p>
                                </div>

                                {/* Сообщения об ошибках */}
                                {error &&
                                    <div className="alert alert-danger py-2 text-center small" role="alert">
                                        ❌ {error}
                                    </div>
                                }

                                {/* Сообщение об успехе */}
                                {successMessage &&
                                    <div className="alert alert-success py-2 text-center small" role="alert">
                                        ✅ {successMessage}
                                    </div>
                                }

                                {/* PIN поля */}
                                <div className="d-flex justify-content-center mb-4" style={{ gap: '12px' }}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <input
                                            key={index}
                                            className={`form-control text-center ${
                                                error ? 'border-danger' :
                                                    successMessage ? 'border-success' : ''
                                            }`}
                                            readOnly
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                borderRadius: '8px'
                                            }}
                                            value={pincode[index] || ''}
                                        />
                                    ))}
                                </div>

                                {/* Цифровая клавиатура */}
                                <div className="d-flex flex-column align-items-center" style={{ gap: '10px' }}>
                                    {digitButtons.map((row, rowIndex) => (
                                        <div key={rowIndex} className="d-flex" style={{ gap: '10px' }}>
                                            {row.map((digit) => (
                                                <button
                                                    key={digit}
                                                    className="btn btn-outline-primary"
                                                    onClick={() => handleClick(digit.toString())}
                                                    disabled={isLoading} // Блокируем при загрузке
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        fontSize: '18px',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {digit}
                                                </button>
                                            ))}
                                        </div>
                                    ))}

                                    {/* Последний ряд с 0 и управляющими кнопками */}
                                    <div className="d-flex" style={{ gap: '10px' }}>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={handleClear}
                                            disabled={isLoading}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                fontSize: '16px'
                                            }}
                                            title="Очистить все"
                                        >
                                            <IoClose size={20} />
                                        </button>

                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => handleClick('0')}
                                            disabled={isLoading}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                fontSize: '18px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            0
                                        </button>

                                        <button
                                            className="btn btn-outline-warning"
                                            onClick={handleDelete}
                                            disabled={isLoading}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                fontSize: '16px'
                                            }}
                                            title="Удалить последнюю цифру"
                                        >
                                            <IoBackspaceOutline size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Кнопка входа */}
                                {isComplete && (
                                    <div className="text-center mt-4">
                                        <button
                                            className="btn btn-success px-4"
                                            onClick={handleLoading} // ✅ ИСПРАВЛЕНО
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Проверка...
                                                </>
                                            ) : (
                                                'Войти'
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Показываем прогресс */}
                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Введено: {pincode.length}/4
                                        {userData && (
                                            <span className="ms-2">
                                                | Пользователь: {telegramUsername}
                                            </span>
                                        )}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinCodePage;