import { IoArrowBack } from "react-icons/io5";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckOrder } from "../../hooks/useCheckOrder";
import { useSearchByLeadId } from "../../hooks/useSearchByLeadId";
import { useUserByAt } from "../../hooks/findUserByAt";
import Header from "../Header/Header";
import {useTelegram} from "../../hooks/useTelegram";

const SearchOrder = () => {
    const navigate = useNavigate();

    // ✅ цвета статусов
    const statusColors = {
        "Другой регион": "#00e5ff",
        "Невалидный": "#f44336",
        "Недозвон": "#9e9e9e",
        "В работе": "#ffff00",
        "Ночной": "#1976d2",
        "Ночной ранний": "#bfe1f6",
        "Нужно подтверждение": "#76ff03",
        "Нужно согласование": "#ffa726",
        "Оформлен": "#2e7d32",
        "Прозвонить завтра": "#e6cff1",
        "Статус заказа": "#e0e0e0",
    };

    // ✅ режим поиска: phone | order
    const [searchMode, setSearchMode] = useState("phone");
    const [displayValue, setDisplayValue] = useState("");
    const [lookingNumber, setLookingNumber] = useState("");
    const [orderId, setOrderId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ данные пользователя
    const { user } = useTelegram();
    const telegramUsername = user?.username || "devapi1";
    const mongoUser = useUserByAt(telegramUsername);

    // ✅ хуки для поиска
    const { response, error, loading, checkOrder, isOwnerPhone } = useCheckOrder();
    const { data: leadData, loading: leadLoading, error: leadError, isOwner } = useSearchByLeadId(orderId, telegramUsername);

    const inputRef = useRef(null);

    // ✅ сброс состояния при смене режима
    useEffect(() => {
        setDisplayValue("");
        setLookingNumber("");
        setOrderId("");
    }, [searchMode]);

    const handleBack = () => {
        navigate("/welcomePage");
    };

    // ✅ форматируем номер телефона - простая система
    const formatPhoneNumber = (value) => {
        // Удаляем всё, кроме цифр
        const digits = value.replace(/\D/g, '');

        // Убираем ведущую 1, если ввели вручную
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
    //
    // ✅ обработчик для ввода телефона - простая система
    // const handleChangePhone = (e) => {
    //     const input = e.target.value;
    //
    //     // Убираем +1 если он есть в начале, оставляем только цифры
    //     let cleanInput = input.replace(/^\+1/, '').replace(/\D/g, '');
    //
    //     // Сохраняем чистые цифры
    //     setLookingNumber(cleanInput);
    //
    //     // Показываем с +1
    //     setDisplayValue(formatPhoneNumber(cleanInput));
    // };
    const handleChangePhone = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        // Очищенный номер без +1
        const cleanInput = digits.startsWith('1') ? digits.slice(1) : digits;

        setLookingNumber(cleanInput);
        setDisplayValue(formatPhoneNumber(cleanInput));
    };
    // ✅ обработчик для ввода Lead ID
    const handleChangeOrder = (e) => {
        setDisplayValue(e.target.value.trim());
    };

    // ✅ поиск по кнопке
    const handleSearch = () => {
        if (!displayValue.trim()) return;

        switch (searchMode) {
            case "phone":
                checkOrder(lookingNumber,telegramUsername);
                break;
            case "order":
                setOrderId(displayValue.trim());
                break;
            default:
                break;
        }
    };

    // ✅ обработка Enter
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // ✅ проверка владельца заказа (используем правильные поля)
    const checkOrderOwnership = (order) => {
        if (!mongoUser) return false;
        return (
            order.team === mongoUser.team ||           // "C" === "C"
            order.manager_id === mongoUser.manager_id || // "E" === "E"
            order.owner === mongoUser.at ||             // "devapi1" === "devapi1"
            order.owner === telegramUsername            // "devapi1" === "devapi1"
        ) ;
    };

    // ✅ определяем права доступа для конкретного заказа в зависимости от режима поиска
    const getAccessRights = (order) => {
        if (searchMode === "phone") {
            // для поиска по телефону проверяем каждый заказ отдельно
            return checkOrderOwnership(order);
        } else if (searchMode === "order") {
            return isOwner; // для поиска по Lead ID используем isOwner
        }
        return false;
    };

    // ✅ обработка открытия заказа
    const handleOpenOrder = (order) => {
        // Всегда используем локальную проверку владельца
        const isOwner1 = checkOrderOwnership(order);

        if (isOwner1) {
            navigate(`/change/${order.order_id || order.lead_id}`);
        } else {
            setSelectedOrder(order);
            setShowModal(true);
            setShowModal(true);
        }
    };

    // ✅ принудительное открытие заказа
    const handleForceOpen = () => {
        setShowModal(false);
        navigate(`/change/${selectedOrder.order_id || selectedOrder.lead_id}`);
    };

    // ✅ закрытие модального окна
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    // ✅ определяем можно ли искать
    const canSearch = displayValue.trim().length > 0;

    // ✅ компонент для отображения владельца
    const OrderOwner = ({ order }) => {
        const ownerData = useUserByAt(order.owner);

        if (order.manager_name) return order.manager_name;
        if (order.team_name) return order.team_name;
        if (ownerData?.name) return ownerData.name;
        if (ownerData?.username) return `${ownerData.username}`;
        if (order.owner) return `${order.owner}`;
        return "Unknown";
    };

    // ✅ форматирование времени
    const formatDate = (dateString) => {
        if (!dateString) return null;
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return null;
        }
    };

    // ✅ рендерим компактную карточку заказа
    const renderOrderCard = (order, index) => {
        // Получаем права доступа для конкретного заказа
        const hasAccess = getAccessRights(order);

        const orderDate = formatDate(order.created_at || order.date);
        const statusColor = statusColors[order.text_status] || "#e0e0e0";

        return (
            <div key={index} className="border-start border-warning border-4 bg-light p-3 rounded-end mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <span className="badge bg-primary fs-6 mb-2">
                            #{order.order_id || order.lead_id}
                        </span>
                        {orderDate && (
                            <div className="text-muted small">
                                <i className="bi bi-calendar3 me-1"></i>
                                {orderDate}
                            </div>
                        )}
                    </div>
                    <button
                        className={`btn ${hasAccess ? 'btn-success' : 'btn-outline-warning'} btn-sm`}
                        onClick={() => handleOpenOrder(order)}
                    >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Open Order
                    </button>
                </div>

                <div className="row g-0 align-items-center text-sm">
                    <div className="col-auto me-3">
                        <i className="bi bi-flag me-1"></i>
                        <span className="fw-bold">Status:</span>
                    </div>
                    <div className="col-auto me-3">
                        <span
                            className="badge"
                            style={{
                                backgroundColor: statusColor,
                                color: statusColor === "#ffff00" || statusColor === "#76ff03" ? "black" : "white"
                            }}
                        >
                            {order.text_status || 'No Status'}
                        </span>
                    </div>
                </div>

                <div className="row g-0 align-items-center text-sm mt-2">
                    <div className="col-auto me-3">
                        <i className="bi bi-person me-1"></i>
                        <span className="fw-bold">Owner:</span>
                    </div>
                    <div className="col-auto me-3">
                        <span className="text-primary">
                            <OrderOwner order={order} />
                        </span>
                    </div>
                </div>

                {order.phone && (
                    <div className="row g-0 align-items-center text-sm mt-2">
                        <div className="col-auto me-3">
                            <i className="bi bi-telephone me-1"></i>
                            <span className="fw-bold">Phone:</span>
                        </div>
                        <div className="col-auto">
                            {hasAccess ? (
                                <a href={`tel:${order.phone}`} className="text-decoration-none">
                                    {order.phone}
                                </a>
                            ) : (
                                <span className="text-muted">
                                    {'*'.repeat(order.phone.length)}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {!hasAccess && (
                    <div className="row g-0 mt-2">
                        <div className="col-12">
                            <small className="text-warning">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                You are not the owner of this order
                            </small>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ✅ рендерим результаты поиска
    const renderResults = () => {
        const currentError = searchMode === "phone" ? error : leadError;

        if (currentError) {
            return (
                <div className="alert alert-danger mt-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {currentError}
                </div>
            );
        }

        // Для поиска по телефону
        if (searchMode === "phone" && response?.orders) {
            return (
                <div className="mt-3">
                    <h6 className="text-muted mb-3">
                        <i className="bi bi-hash me-1"></i>
                        {searchMode === "phone" ? "Phone Search Results:" : `Lead ID: ${orderId}`}
                    </h6>

                    {response.orders.length > 0 ? (
                        <div>
                            {response.orders.map((order, idx) => renderOrderCard(order, idx))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted">
                            <i className="bi bi-inbox display-6"></i>
                            <p className="mt-2">No orders found</p>
                        </div>
                    )}
                </div>
            );
        }

        // Для поиска по Lead ID
        if (searchMode === "order" && leadData) {
            return (
                <div className="mt-3">
                    <h6 className="text-muted mb-3">
                        <i className="bi bi-hash me-1"></i>
                        Lead ID: {orderId}
                    </h6>

                    {renderOrderCard(leadData, 0)}
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <Header />

            <div className="container py-3">
                {/* Компактный header */}
                <div className="d-flex align-items-center mb-3">
                    <button
                        className="btn btn-link text-dark p-0 me-3"
                        onClick={handleBack}
                        style={{ fontSize: "18px", textDecoration: "none" }}
                    >
                        <IoArrowBack />
                    </button>
                    <h4 className="mb-0">
                        <i className="bi bi-search me-2"></i>
                        Search Orders
                    </h4>
                </div>

                {/* Компактная форма поиска */}
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                        {/* Переключатель режимов */}
                        <div className="btn-group w-100 mb-3" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="searchMode"
                                id="phone-mode"
                                checked={searchMode === "phone"}
                                onChange={() => setSearchMode("phone")}
                            />
                            <label className="btn btn-outline-primary" htmlFor="phone-mode">
                                <i className="bi bi-telephone me-1"></i>
                                Phone Number
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="searchMode"
                                id="order-mode"
                                checked={searchMode === "order"}
                                onChange={() => setSearchMode("order")}
                            />
                            <label className="btn btn-outline-primary" htmlFor="order-mode">
                                <i className="bi bi-hash me-1"></i>
                                Lead ID
                            </label>
                        </div>

                        {/* Поле ввода */}
                        <div className="input-group mb-3">
                            <span className="input-group-text">
                                {searchMode === "phone" ? (
                                    <i className="bi bi-telephone"></i>
                                ) : (
                                    <i className="bi bi-hash"></i>
                                )}
                            </span>
                            <input
                                ref={inputRef}
                                className="form-control"
                                placeholder={
                                    searchMode === "phone"
                                        ? "Enter phone number..."
                                        : "Enter Lead ID..."
                                }
                                type="text"
                                value={displayValue}
                                onChange={
                                    searchMode === "phone"
                                        ? handleChangePhone
                                        : handleChangeOrder
                                }
                                inputMode={searchMode === "phone" ? "numeric" : "text"}
                                autoComplete={searchMode === "phone" ? "tel" : "off"}
                                disabled={loading || leadLoading}
                            />
                        </div>

                        {/* Кнопка поиска */}
                        <button
                            className={`btn w-100 ${canSearch ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={handleSearch}
                            disabled={!canSearch || loading || leadLoading}
                        >
                            {loading || leadLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-search me-2"></i>
                                    Search Orders
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Результаты поиска */}
                {renderResults()}
            </div>

            {/* Модальное окно предупреждения */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h6 className="modal-title">
                                    <i className="bi bi-shield-exclamation me-2"></i>
                                    Access Warning
                                </h6>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-3">
                                    <strong>You are not the owner of this order!</strong>
                                </p>
                                <div className="bg-light p-3 rounded mb-3">
                                    <div><strong>Order ID:</strong> #{selectedOrder?.order_id || selectedOrder?.lead_id}</div>
                                    <div><strong>Owner:</strong> <OrderOwner order={selectedOrder} /></div>
                                    <div><strong>Status:</strong> {selectedOrder?.text_status || 'No status'}</div>
                                </div>
                                <p className="text-muted small">
                                    This order belongs to another team member. You can view it, but some modifications may be restricted.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleForceOpen}
                                >
                                    <i className="bi bi-eye me-1"></i>
                                    View Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchOrder;