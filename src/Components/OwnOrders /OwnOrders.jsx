import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useMyOrders } from "../../hooks/useMyOrders";
import { useTelegram } from "../../hooks/useTelegram";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../Header/Header';
import { IoArrowBack, IoRefresh, IoEye, IoCreate, IoCall, IoLocation, IoPerson, IoCalendar, IoCard, IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';
import { BsCardText } from 'react-icons/bs';

const OwnOrders = () => {
    const { isLoading, orders, error, myOrders, refetchOrders } = useMyOrders();
    const { user } = useTelegram();
    const navigate = useNavigate();
    const telegramUsername = user?.username?.toLowerCase() || "devapi1";

    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        myOrders(telegramUsername);
    }, [telegramUsername]);

    const handleRefresh = () => {
        myOrders(telegramUsername);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            "В работе": "#ffff00",
            "Другой регион": "#00e5ff",
            "Невалидный": "#f44336",
            "Недозвон": "#9e9e9e",
            "Ночной": "#1976d2",
            "Ночной ранний": "#bfe1f6",
            "Нужно подтверждение": "#76ff03",
            "Нужно согласование": "#ffa726",
            "Оформлен": "#2e7d32",
            "Прозвонить завтра": "#e6cff1",
            "Статус заказа": "#e0e0e0"
        };
        return statusColors[status] || "#e0e0e0";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Не указано";
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPhone = (phone) => {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+1 (${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
        }
        return phone;
    };

    const getFilteredOrders = () => {
        if (!orders?.orders) return [];

        let filtered = [...orders.orders];

        // Фильтрация
        if (filter !== 'all') {
            filtered = filtered.filter(order => order.text_status === filter);
        }

        // Сортировка
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
                case 'oldest':
                    return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
                case 'amount-high':
                    return (b.total || 0) - (a.total || 0);
                case 'amount-low':
                    return (a.total || 0) - (b.total || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const getUniqueStatuses = () => {
        if (!orders?.orders) return [];
        const statuses = orders.orders.map(order => order.text_status).filter(Boolean);
        return [...new Set(statuses)];
    };

    if (isLoading) {
        return (
            <div className="container py-4">
                <div className="position-relative">
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            background: '#fff',
                            padding: '2px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            zIndex: 1000,
                            border: '0px'
                        }}
                    >
                        <IoArrowBack />
                    </button>
                    <div className="row gap-3">
                        <Header />
                    </div>
                </div>
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Загружаем ваши заказы...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-4">
                <div className="position-relative">
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            background: '#fff',
                            padding: '2px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            zIndex: 1000,
                            border: '0px'
                        }}
                    >
                        <IoArrowBack />
                    </button>
                    <div className="row gap-3">
                        <Header />
                    </div>
                </div>
                <div className="alert alert-danger mt-4" role="alert">
                    <h4 className="alert-heading">❌ Ошибка загрузки</h4>
                    <p className="mb-3">{error}</p>
                    <hr />
                    <button
                        className="btn btn-outline-danger"
                        onClick={handleRefresh}
                    >
                        <IoRefresh className="me-2" />
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    const filteredOrders = getFilteredOrders();
    const uniqueStatuses = getUniqueStatuses();

    return (
        <div className="container py-4">
            <div className="position-relative">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        background: '#fff',
                        padding: '2px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        zIndex: 1000,
                        border: '0px'
                    }}
                >
                    <IoArrowBack />
                </button>
                <div className="row gap-3">
                    <Header />
                </div>
            </div>

            <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">📋 Мои заказы</h2>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <IoRefresh className="me-1" />
                        Обновить
                    </button>
                </div>

                {/* Статистика */}
                {orders && (
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="card text-center h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        <IoCard className="me-2" />
                                        Всего заказов
                                    </h5>
                                    <h3 className="text-primary mb-0">{orders.count || 0}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-success">
                                        <IoCheckmarkCircle className="me-2" />
                                        Завершено
                                    </h5>
                                    <h3 className="text-success mb-0">
                                        {orders.orders?.filter(o => o.text_status === 'Оформлен').length || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-warning">
                                        <IoTimeOutline className="me-2" />
                                        В работе
                                    </h5>
                                    <h3 className="text-warning mb-0">
                                        {orders.orders?.filter(o => o.text_status === 'В работе').length || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Фильтры и сортировка */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <label className="form-label">Фильтр по статусу:</label>
                        <select
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">Все заказы</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Сортировка:</label>
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Сначала новые</option>
                            <option value="oldest">Сначала старые</option>
                            <option value="amount-high">По сумме (больше)</option>
                            <option value="amount-low">По сумме (меньше)</option>
                        </select>
                    </div>
                </div>

                {/* Список заказов */}
                {filteredOrders.length > 0 ? (
                    <div className="row">
                        {filteredOrders.map((order, index) => (
                            <div key={order._id || index} className="col-md-6 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>ID: {order.leadId || order.order_id || 'N/A'}</strong>
                                        </div>
                                        <span
                                            className="badge rounded-pill px-3"
                                            style={{
                                                backgroundColor: getStatusColor(order.text_status),
                                                color: '#000',
                                                fontSize: '0.8em'
                                            }}
                                        >
                                            {order.text_status || 'Без статуса'}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <IoPerson className="me-2 text-primary" />
                                            {order.leadName || 'Не указано'}
                                        </h5>

                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <BsCardText className="me-1" />
                                                Сlient ID:{order.client_id}
                                            </small>
                                        </div>

                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <IoLocation className="me-1" />
                                                {order.address || order.city || 'Адрес не указан'}
                                            </small>
                                        </div>

                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <IoCalendar className="me-1" />
                                                {formatDate(order.date)}
                                            </small>
                                        </div>

                                        {order.master && (
                                            <div className="mb-2">
                                                <small className="text-muted">
                                                    👷‍♂️ Мастер: {order.master}
                                                </small>
                                            </div>
                                        )}

                                        {order.comment && (
                                            <div className="mb-2">
                                                <small className="text-muted fst-italic">
                                                    💬 {order.comment}
                                                </small>
                                            </div>
                                        )}

                                        {/* Услуги */}
                                        {order.services && order.services.length > 0 && (
                                            <div className="mb-3">
                                                <h6 className="text-muted mb-2">Услуги:</h6>
                                                <div className="small">
                                                    {order.services.slice(0, 3).map((service, idx) => (
                                                        <div key={idx} className="d-flex justify-content-between">
                                                            <span>{service.label} (x{service.quantity || 1})</span>
                                                            <span className="fw-bold">{service.price}$</span>
                                                        </div>
                                                    ))}
                                                    {order.services.length > 3 && (
                                                        <small className="text-muted">
                                                            ...и еще {order.services.length - 3} услуг
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer d-flex justify-content-between align-items-center">
                                        <div className="fw-bold text-success fs-5">
                                            💰 {order.total || 0}$
                                        </div>
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    // Показать детали заказа (можно реализовать модальное окно)
                                                    alert(`Детали заказа ${order.leadId}:\n${JSON.stringify(order, null, 2)}`);
                                                }}
                                                title="Просмотреть детали"
                                            >
                                                <IoEye />
                                            </button>
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() => navigate(`/change/${order.order_id}`)}
                                                title="Редактировать"
                                            >
                                                <IoCreate />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <IoCard size={64} className="text-muted" />
                        </div>
                        <h4 className="text-muted">Заказы не найдены</h4>
                        <p className="text-muted">
                            {filter === 'all'
                                ? 'У вас пока нет заказов'
                                : `Нет заказов со статусом "${filter}"`
                            }
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/order-change')}
                        >
                            <IoCreate className="me-2" />
                            Создать первый заказ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnOrders;