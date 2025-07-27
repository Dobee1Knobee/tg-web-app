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

const WelcomePage = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const [lookingNumber, setLookingNumber] = useState("");
    const [isOnShift, setIsOnShift] = useState(false);
    const [searchMode, setSearchMode] = useState("phone"); // "phone" или "order"

    const { response, error, loading, checkOrder } = useCheckOrder();
    const inputRef = useRef(null);
    const { user } = useTelegram();
    const telegramUsername = user?.username || "devapi1";
    const mongoUser = useUserByAt(telegramUsername);

    // Правильное использование хуков
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

    // ИСПРАВЛЕННЫЕ функции для работы со сменой
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

    // ДОБАВЛЯЕМ недостающую функцию handleShiftToggle
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

    // Обновляем состояние при успешном выполнении операций
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

    // Стили для красивого свитчера
    const switcherStyles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
            padding: '20px',
        },
        switch: {
            position: 'relative',
            width: '200px',
            height: '50px',
            background: isOnShift
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)'
                : 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
            borderRadius: '25px',
            cursor: startLoading || endLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            boxShadow: isOnShift
                ? '0 8px 25px rgba(255, 107, 107, 0.3)'
                : '0 8px 25px rgba(81, 207, 102, 0.3)',
            opacity: startLoading || endLoading ? 0.7 : 1,
        },
        slider: {
            position: 'absolute',
            top: '3px',
            left: isOnShift ? '147px' : '3px',
            width: '44px',
            height: '44px',
            background: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
        },
        label: {
            position: 'absolute',
            width: '100%',
            height: '100%',

            marginTop:"-3vh",
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOnShift ? 'flex-start' : 'flex-end',
            paddingLeft: isOnShift ? '6vh' : '0',
            paddingRight: isOnShift ? '0' : '7vh',
            color: 'white',
            fontWeight: '600',
            fontSize: '13px',
            pointerEvents: 'none',
        },
        error: {
            fontSize: '11px',
            color: '#dc3545',
            marginTop: '5px',
            fontWeight: '500',
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 align-items-center mt-5 overflow-y-hidden">
            <Header />

            <div className="d-flex flex-column gap-3 justify-content-center align-items-center mt-5">
                {!isSearching && (
                    <div className="w-100 text-center">
                        <h3>Hi, {mongoUser?.name}</h3>

                        <button className="btn btn-warning w-100 mb-3" onClick={() => navigate('/form')}>
                            New order
                        </button>
                        <button className="btn btn-primary w-100 mb-3" onClick={() => navigate('/SearchOrder')}>
                            Search order
                        </button>
                        <button className="btn btn-success w-100" onClick={() => navigate('/OwnOrders')}>My orders</button>
                        <button className="btn btn-info w-100 mt-3" onClick={() => navigate('/BuferedOrders')}>Buffer</button>
                        <button className="btn btn-danger w-100 mt-3" onClick={() => navigate('/BuferedOrders')}>Analytics</button>
                    </div>
                )}


            </div>

            {/* КРАСИВЫЙ МИНИМАЛИСТИЧНЫЙ СВИТЧЕР */}
            <div style={switcherStyles.container}>
                <button
                    onClick={handleShiftToggle}
                    disabled={startLoading || endLoading}
                    style={switcherStyles.switch}
                >
                    {/* Слайдер */}
                    <div style={switcherStyles.slider}>
                        {startLoading || endLoading ? '⏳' : (isOnShift ? '●' : '○')}
                    </div>

                    {/* Текст внутри свитчера */}
                    <div style={switcherStyles.label}>
                        {startLoading || endLoading
                            ? 'Loading...'
                            : (isOnShift ? 'Finish shift' : 'Start shift')
                        }
                    </div>
                </button>

                {/* Ошибки */}
                {(startError || endError) && (
                    <div style={switcherStyles.error}>
                        {startError || endError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;
