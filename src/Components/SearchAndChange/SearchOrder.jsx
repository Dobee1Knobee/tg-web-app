import { IoArrowBack } from "react-icons/io5";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckOrder } from "../../hooks/useCheckOrder";
import Header from "../Header/Header";

const SearchOrder = () => {
    const navigate = useNavigate();
    const [searchMode, setSearchMode] = useState("phone");
    const [displayValue, setDisplayValue] = useState("");
    const [lookingNumber, setLookingNumber] = useState("");
    const { response, error, loading, checkOrder } = useCheckOrder();
    const inputRef = useRef(null);

    const handleBack = () => {
        navigate("/welcomePage");
    };

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

    return (
        <div className="container mt-4 d-flex flex-column justify-content-center">
            <Header />
            <div className="card shadow-sm p-4 mx-auto mt-5" style={{ maxWidth: "420px", width: "100%" }}>
                {/* Назад */}
                <button
                    className="btn btn-link text-muted p-0 mb-2"
                    onClick={handleBack}
                    style={{ fontSize: "18px" }}
                >
                    <IoArrowBack />
                </button>

                <h5 className="text-center mb-3">Search Existing Order</h5>

                {/* Свитчер */}
                <div className="btn-group w-100 mb-3">
                    <button
                        className={`btn btn-sm ${searchMode === "phone" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setSearchMode("phone")}
                    >
                        Phone
                    </button>
                    <button
                        className={`btn btn-sm ${searchMode === "order" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setSearchMode("order")}
                    >
                        Order ID
                    </button>
                </div>

                {/* Поле ввода */}
                <input
                    ref={inputRef}
                    className="form-control text-center mb-3"
                    placeholder={searchMode === "phone" ? "Enter phone number" : "Enter order ID"}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    inputMode={searchMode === "phone" ? "numeric" : "text"}
                    autoComplete="tel"
                />

                {/* Кнопка поиска */}
                <button
                    className="btn btn-success btn-sm w-100"
                    onClick={handleSearch}
                >
                    {loading ? 'Searching…' : 'Search'}
                </button>

                {/* Ошибка */}
                {error && <p className="text-danger mt-3 text-center">{error}</p>}

                {/* Результат */}
                {response && (
                    <div className="mt-3 text-center">
                        <h6>{response.message}</h6>
                        {response.orders?.length > 0 && (
                            <ul className="list-group mt-2">
                                {response.orders.map((order, idx) => (
                                    <li
                                        key={idx}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            Order <strong>{order.order_id}</strong> — {order.text_status || 'No status'}
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/change/${order.order_id}`)}
                                        >
                                            Open
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOrder;
