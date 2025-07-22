import React, { useEffect, useRef, useState } from 'react';
import "./Welcome.css";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { IoArrowBack } from "react-icons/io5";
import { useCheckOrder } from "../../hooks/useCheckOrder";
import {useTelegram} from "../../hooks/useTelegram";
import {useUserByAt} from "../../hooks/findUserByAt";

const WelcomePage = () => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [displayValue, setDisplayValue] = useState("");
    const [lookingNumber, setLookingNumber] = useState("");
    const { response, error, loading, checkOrder } = useCheckOrder();
    const inputRef = useRef(null);
    const { user } = useTelegram();
    const telegramUsername = user?.username?.toLowerCase() || "devapi1";
    const mongoUser = useUserByAt(telegramUsername);

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

    useEffect(() => {
        if (isSearching && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearching]);

    return (
        <div className="d-flex flex-column min-vh-100 align-items-center mt-5 overflow-y-hidden">
            <Header />

            <div className="d-flex flex-column gap-3 justify-content-center align-items-center mt-5">
                {!isSearching && (
                    <div className="w-100 text-center">
                        <h3>Добрый день, {mongoUser?.name}</h3>

                        <button className="btn btn-warning w-100 mb-3" onClick={() => navigate('/form')}>
                            Новая заявка
                        </button>
                        <button className="btn btn-primary w-100 mb-3" onClick={() => setIsSearching(true)}>
                            Найти существующий заказ
                        </button>
                        <button className="btn btn-success w-100" onClick={() => navigate('/OwnOrders')}>Мои заказы</button>
                        <button className="btn btn-danger w-100 mt-3" onClick={() => navigate('/OwnOrders')}>Аналитика</button>

                    </div>
                )}

                {isSearching && (
                    <div className="w-100 position-relative text-center">

                        <button
                            className="position-absolute"
                            onClick={handleBack}
                            style={{
                                top: -66,
                                left: -10,
                                background: 'transparent',
                                fontSize: '24px',
                                cursor: 'pointer',
                                border: 'none',
                                padding: '8px',
                                zIndex: 10
                            }}
                        >
                            <IoArrowBack />
                        </button>

                        <h3>Поиск существующего заказа</h3>

                        <input
                            ref={inputRef}
                            className="form-control mt-4"
                            placeholder="Введите номер"
                            type="text"
                            value={displayValue}
                            onChange={handleChange}
                            inputMode="numeric"
                            autoComplete="tel"
                            style={{ textAlign: 'center' }}
                        />

                        <button
                            className="btn btn-success d-block mt-3 mx-auto text-center px-5"
                            onClick={handleSearch}
                        >
                            {loading ? 'Поиск...' : 'Поиск'}
                        </button>

                        {error && <p className="text-danger mt-3">{error}</p>}

                        {response && (
                            <div className="mt-4 text-center">
                                <h5>{response.message}</h5>
                                {response.orders?.length > 0 && (
                                    <ul className="list-group mt-2">
                                        {response.orders.map((order, idx) => (
                                            <li
                                                key={idx}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    Заказ <strong>{order.order_id}</strong> — {order.text_status || 'без статуса'}
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary "  style={{marginLeft:"1vh"}}
                                                    onClick={() => navigate(`/change/${order.order_id}`)}                                                >
                                                    Открыть
                                                </button>

                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomePage;
