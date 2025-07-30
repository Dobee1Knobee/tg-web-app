import React, { useEffect, useRef, useState } from 'react';
import "./Welcome.css";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { IoArrowBack } from "react-icons/io5";
import { useCheckOrder } from "../../hooks/useCheckOrder";
import {useTelegram} from "../../hooks/useTelegram";
import {useUserByAt} from "../../hooks/findUserByAt";
import {useEndShift, useStartShift} from "../../hooks/startEndShift";
import SimpleButton from "../Button/Button";

const WelcomePage = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const [lookingNumber, setLookingNumber] = useState("");
    const [isOnShift, setIsOnShift] = useState(false);
    const [searchMode, setSearchMode] = useState("phone");

    const { response, error, loading, checkOrder } = useCheckOrder();
    const inputRef = useRef(null);
    const { user } = useTelegram();
    const telegramUsername = user?.username || "devapi1";
    const mongoUser = useUserByAt(telegramUsername);

    const hoverColors = {
        new: '#e3f2fd',      // Очень светло-голубой
        search: '#fff3e0',    // Очень светло-оранжевый
        orders: '#e8f5e8',    // Очень светло-зеленый
        buffer: '#f3e5f5',    // Очень светло-фиолетовый
    };

    const { startShift, loading: startLoading, error: startError, success: startSuccess } = useStartShift();
    const { endShift, loading: endLoading, error: endError, success: endSuccess } = useEndShift();

    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, '');
        const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;

        let formatted = '+1 ';
        for (let i = 0; i < cleaned.length; i++) {
            if (i === 0) formatted += '(';
            if (i === 3) formatted += ') ';
            if (i === 6) formatted += '-';
            formatted += cleaned[i];
        }

        return formatted;
    };

    const handleChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;

        setLookingNumber(cleaned);
        setDisplayValue(formatPhoneNumber(input));
    };

    const handleSearch = () => {
        checkOrder(lookingNumber);
    };

    const handleBack = () => {
        setIsSearching(false);
        setDisplayValue("");
        setLookingNumber("");
        setTimeout(() => {
            checkOrder(null);
        }, 0);
    };

    const handleStartShift = async () => {
        try {
            const result = await startShift(telegramUsername);
            console.log('Смена начата:', result);
        } catch (err) {
            console.log('Ошибка начала смены:', err.message);
        }
    };

    const handleEndShift = async () => {
        try {
            const result = await endShift(telegramUsername);
            console.log('Смена завершена:', result);
        } catch (err) {
            console.log('Ошибка завершения смены:', err.message);
        }
    };

    const handleShiftToggle = async () => {
        if (isOnShift) {
            await handleEndShift();
        } else {
            await handleStartShift();
        }
    };

    // Синхронизируем состояние смены с данными пользователя
    useEffect(() => {
        if (mongoUser?.working !== undefined) {
            setIsOnShift(mongoUser.working);
        }
    }, [mongoUser]);

    useEffect(() => {
        if (startSuccess) {
            setIsOnShift(true);
        }
    }, [startSuccess]);

    useEffect(() => {
        if (endSuccess) {
            setIsOnShift(false);
        }
    }, [endSuccess]);

    useEffect(() => {
        if (isSearching && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearching]);

    // Улучшенные стили
    const pageStyles = {
        container: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '20px',
        },
        welcomeCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '380px',
            width: '100%',
            margin: '0 auto',
        },
        greeting: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#2d3748',
            textAlign: 'center',
            marginBottom: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        buttonsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px',
        }
    };

    // Улучшенные стили для свитчера
    const switcherStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px',
        },
        switch: {
            position: 'relative',
            width: '180px',
            height: '48px',
            background: isOnShift
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
                : 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
            borderRadius: '24px',
            cursor: startLoading || endLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            boxShadow: isOnShift
                ? '0 6px 20px rgba(255, 107, 107, 0.25)'
                : '0 6px 20px rgba(81, 207, 102, 0.25)',
            opacity: startLoading || endLoading ? 0.7 : 1,
        },
        slider: {
            position: 'absolute',
            top: '3px',
            left: isOnShift ? '129px' : '3px',
            width: '42px',
            height: '42px',
            background: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
        },
        label: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            marginTop:"-1.5rem",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '13px',
            pointerEvents: 'none',
            paddingLeft: isOnShift ? '0' : '8px',
            paddingRight: isOnShift ? '8px' : '0',
        },
        error: {
            fontSize: '12px',
            color: '#dc3545',
            textAlign: 'center',
            fontWeight: '500',
            padding: '8px 12px',
            background: 'rgba(220, 53, 69, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(220, 53, 69, 0.2)',
        }
    };

    return (
        <div style={pageStyles.container}>
            <Header />

            <div className="d-flex flex-column justify-content-center align-items-center mt-5">
                {!isSearching && (
                    <div style={pageStyles.welcomeCard}>
                        <div style={pageStyles.greeting}>
                            Hi, {mongoUser?.name || 'User'}! 👋
                        </div>

                        <div style={pageStyles.buttonsContainer}>
                            <SimpleButton
                                onClick={() => navigate('/form')}
                                hoverColor={hoverColors.new}
                                icon="bi bi-plus-circle"
                            >
                                New order
                            </SimpleButton>

                            <SimpleButton
                                onClick={() => navigate('/SearchOrder')}
                                hoverColor={hoverColors.search}
                                icon="bi bi-search"
                            >
                                Search order
                            </SimpleButton>

                            <SimpleButton
                                onClick={() => navigate('/OwnOrders')}
                                hoverColor={hoverColors.orders}
                                icon="bi bi-list-ul"
                            >
                                My orders
                            </SimpleButton>

                            <SimpleButton
                                onClick={() => navigate('/BuferedOrders')}
                                hoverColor={hoverColors.buffer}
                                icon="bi bi-archive"
                            >
                                Buffer
                            </SimpleButton>
                        </div>

                        {/* Красивый свитчер внутри карточки */}
                        <div style={switcherStyles.container}>
                            <button
                                onClick={handleShiftToggle}
                                disabled={startLoading || endLoading}
                                style={switcherStyles.switch}
                            >
                                <div style={switcherStyles.slider}>
                                    {startLoading || endLoading ? '⏳' : (isOnShift ? '●' : '○')}
                                </div>

                                <div style={switcherStyles.label}>
                                    {startLoading || endLoading
                                        ? 'Loading...'
                                        : (isOnShift ? 'Finish shift' : 'Start shift')
                                    }
                                </div>
                            </button>

                            {(startError || endError) && (
                                <div style={switcherStyles.error}>
                                    {startError || endError}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;