import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useMyOrders } from "../../hooks/useMyOrders";
import { useTelegram } from "../../hooks/useTelegram";
import { useTransferOrder } from "../../hooks/useTransferOrder";
import { useTakeBackTransferred } from "../../hooks/useTakeBackTransferred"; // Новый импорт
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../Header/Header';
import {
    IoArrowBack,
    IoRefresh,
    IoEye,
    IoCreate,
    IoCall,
    IoLocation,
    IoPerson,
    IoCalendar,
    IoCard,
    IoCheckmarkCircle,
    IoTimeOutline,
    IoClose,
    IoWarning,
    IoShieldCheckmark,
    IoCopy,
    IoIdCard,
    IoArrowForward,
    IoArrowUndo // Новая иконка для "забрать обратно"
} from 'react-icons/io5';

const OwnOrders = () => {
    const { isLoading, orders, error, myOrders, refetchOrders } = useMyOrders();
    const { transferOrder, error: transferError, giveOrder } = useTransferOrder();
    const { takeBackOrder, takingBackOrder, error: takeBackError } = useTakeBackTransferred(); // Новый хук
    const { user } = useTelegram();
    const navigate = useNavigate();
    const telegramUsername = user?.username || "devapi1";

    const [note, setNote] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [needToBeTransfered, setNeedToBeTransfered] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');

    // Список команд
    const teams = [
        { id: 'A', name: 'TEAM1' },
        { id: 'B', name: 'TEAM2' },
        { id: 'C', name: 'TEAM3' },
    ];

    const getBufferStatus = (order) => {
        if (order.transfer_status === 'in_buffer') {
            // Проверяем, является ли текущий пользователь тем, кто передавал заказ
            const canTakeBack = order.transferred_from?.user_at === telegramUsername;
            return {
                isInBuffer: true,
                teamName: getTeamDisplayName(order.transferred_to_team),
                canTakeBack: canTakeBack,
                transferredBy: order.transferred_from?.user_name || 'Неизвестно'
            };
        }
        return { isInBuffer: false, canTakeBack: false };
    };

    const getTeamDisplayName = (teamQuery) => {
        switch (teamQuery) {
            case 'TEAM1': return 'Команда А';
            case 'TEAM2': return 'Команда Б';
            case 'TEAM3': return 'Команда В';
            case 'TEAM11': return 'Команда W';
            default: return teamQuery;
        }
    };

    useEffect(() => {
        console.log(telegramUsername);
        myOrders(telegramUsername);
    }, [telegramUsername]);

    const handleRefresh = () => {
        myOrders(telegramUsername);
    };

    // Новая функция для забирания заказа обратно
    const handleTakeBack = async (order) => {
        try {
            console.log(`🔙 Забираем обратно заказ ${order.order_id}`);

            const result = await takeBackOrder(order.order_id, telegramUsername);

            if (result.success) {
                console.log('✅ Заказ успешно забран обратно:', result.message);

                // Обновляем список заказов
                myOrders(telegramUsername);

                // Можно показать уведомление об успехе
                // toast.success(result.message) // если используете toast
            } else {
                console.error('❌ Ошибка при забирании заказа обратно:', result.error);
            }
        } catch (error) {
            console.error('❌ Произошла ошибка при забирании заказа обратно:', error);
        }
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && (showModal || showTransferModal)) {
                closeModal();
                closeTransferModal();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showModal, showTransferModal]);

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
            "Статус заказа": "#e0e0e0",
            "Отменен": "#600404"
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

            return `+1 (${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;

    };

    const getFilteredOrders = () => {
        if (!orders?.orders) return [];

        let filtered = [...orders.orders];

        if (filter !== 'all') {
            filtered = filtered.filter(order => order.text_status === filter);
        }

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

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Скопировано в буфер обмена:', text);
        } catch (err) {
            console.error('Ошибка копирования:', err);
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    };

    const openContactModal = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const openTransferModal = (order) => {
        setSelectedOrderForTransfer(order);
        setShowTransferModal(true);
        setSelectedTeam('');
        setNote('');
    };

    const closeTransferModal = () => {
        setShowTransferModal(false);
        setSelectedOrderForTransfer(null);
        setSelectedTeam('');
        setNote('');
    };

    const handleTransfer = async () => {
        if (!selectedTeam || !selectedOrderForTransfer) return;

        try {
            // Формируем объект пользователя для API
            const fromUserData = {
                username: user?.username || telegramUsername,
                name: user?.first_name || user?.username || telegramUsername,
                at: user?.username || telegramUsername
            };

            const result = await transferOrder(
                selectedOrderForTransfer.order_id,  // order_id
                selectedTeam,                       // toTeam
                fromUserData,                       // fromUser как объект
                note                               // note
            );

            if (result.success) {
                // Успешная передача
                console.log('Заказ успешно передан:', result.message);

                // Закрываем модалку
                closeTransferModal();

                // Обновляем список заказов
                myOrders(telegramUsername);

            } else {
                // Ошибка передачи
                console.error('Ошибка передачи заказа:', result.error);
            }
        } catch (error) {
            console.error('Произошла ошибка при передаче заказа:', error);
        }
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
                    <h2 className="mb-0">📋 My orders</h2>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <IoRefresh className="me-1" />
                        Reload
                    </button>
                </div>

                {/* Показ ошибки для takeBack */}


                {/* Статистика */}
                {orders && (
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="card text-center h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">
                                        <IoCard className="me-2" />
                                        Total orders
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
                                        Completed
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
                                        In progress
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
                            <option value="all">All orders</option>
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
                                            <strong>ID:{order.leadId || order.order_id || 'N/A'}</strong>
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {/* Основной статус */}
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
                                            {/*{order.text_status === "Оформлен" && (*/}
                                            {/*    <button className={"btn badge btn-danger px-3"}>Cancel</button>*/}
                                            {/*)}*/}


                                            {/* Статус буфера */}
                                            {(() => {
                                                const bufferStatus = getBufferStatus(order);
                                                return bufferStatus.isInBuffer && (
                                                    <span className="badge bg-warning text-dark px-2" style={{ fontSize: '0.75em' }}>
                                                        📤 В буфере {bufferStatus.teamName}
                                                        {bufferStatus.canTakeBack && (
                                                            <span className="ms-1">• Можно забрать</span>
                                                        )}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <IoPerson className="me-2 text-primary" />
                                            {order.leadName || 'Не указано'}
                                        </h5>

                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <IoIdCard className="me-1" />
                                                Client ID: #c{order.client_id}
                                            </small>
                                        </div>

                                        <div className="mb-2">
                                            <small className="text-muted">
                                                <IoLocation className="me-1" />
                                                {order.address || 'Address not specified'}
                                                {order.zip_code
                                                    ? <span style={{ marginLeft: "8px" }}>{order.zip_code}</span>
                                                    : <span style={{ marginLeft: "8px" }}>ZIP code not specified</span>}
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
                                                        <div key={idx} className="d-flex justify-content-between mb-3 p-2 border rounded">
                                                            {/* Основная услуга */}
                                                            <div className="flex-grow-1 me-3">
                                                                <div className="fw-bold">{service.label}</div>
                                                                <small className="text-muted">Количество: {service.count || 1}</small>
                                                                <div className="fw-bold text-primary">${service.price * service.count} </div>
                                                            </div>

                                                            {/* Дополнительные услуги */}
                                                            <div className="text-end">
                                                                {service.addons && service.addons.map((addon, addonIdx) => (
                                                                    <div key={addonIdx} className="mb-1">
                                                                        <small className="text-muted d-block">{addon.label}</small>
                                                                        <small className="text-muted d-block">Количество: {addon.count}</small>

                                                                        <small className="text-success">+${addon.price * addon.count}</small>
                                                                    </div>
                                                                ))}

                                                                {service.mountType && (
                                                                    <div className="mb-1">
                                                                        <small className="text-muted d-block">Mount: {service.mountType}</small>
                                                                        <small className="text-muted d-block">Количество: {service.mountCount}</small>
                                                                        <small className="text-info">+${service.mountPrice * service.mountCount}</small>
                                                                    </div>
                                                                )}

                                                                {service.addonsPrice > 0 && (
                                                                    <div className="fw-bold text-success mt-2">
                                                                        Доп: +${service.addonsPrice}
                                                                    </div>
                                                                )}
                                                            </div>
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
                                                onClick={() => openContactModal(order)}
                                                title="Просмотреть контакты"
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
                                            {order.text_status === 'Другой регион' && (
                                                <button
                                                    className="btn btn-outline-info btn-sm"
                                                    onClick={() => openTransferModal(order)}
                                                    title="Передать в другую команду"
                                                >
                                                    <IoArrowForward />
                                                </button>
                                            )}
                                            {/* НОВАЯ КНОПКА "Забрать обратно" */}
                                            {(() => {
                                                const bufferStatus = getBufferStatus(order);
                                                return bufferStatus.isInBuffer && bufferStatus.canTakeBack && (
                                                    <button
                                                        className="btn btn-outline-success btn-sm"
                                                        onClick={() => handleTakeBack(order)}
                                                        title="Забрать заказ обратно"
                                                        disabled={takingBackOrder === order.order_id}
                                                    >
                                                        {takingBackOrder === order.order_id ? (
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        ) : (
                                                            <IoArrowUndo />
                                                        )}
                                                    </button>
                                                );
                                            })()}
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
                            onClick={() => navigate('/form')}
                        >
                            <IoCreate className="me-2" />
                            Создать первый заказ
                        </button>
                    </div>
                )}
            </div>

            {/* Модальное окно для контактов */}
            {showModal && selectedOrder && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeModal}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <IoShieldCheckmark className="me-2" />
                                    Конфиденциальные контакты
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeModal}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h6 className="text-muted">Заказ #{selectedOrder.leadId || selectedOrder.order_id}</h6>
                                    <h5>{selectedOrder.leadName || 'Имя не указано'}</h5>
                                </div>

                                {/* Контактная информация */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card bg-light">
                                            <div className="card-body text-center">
                                                <h6 className="card-title">
                                                    <IoCall className="me-2 text-success" />
                                                    Номер телефона
                                                </h6>
                                                <h4 className="text-primary mb-3">
                                                    {`${formatPhone(selectedOrder.phone)}` || 'Не указан'}
                                                </h4>
                                                <button
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => copyToClipboard(selectedOrder.phone, 'Номер телефона')}
                                                    disabled={!selectedOrder.phone}
                                                >
                                                    <IoCopy className="me-1" />
                                                    Копировать
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Client ID для коммуникации */}
                                {selectedOrder.client_id && (
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="card bg-info-subtle">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">
                                                        <IoPerson className="me-2 text-info" />
                                                        ID клиента для коммуникации
                                                    </h6>
                                                    <h5 className="text-info mb-2">#c{selectedOrder.client_id}</h5>
                                                    <button
                                                        className="btn btn-outline-info btn-sm"
                                                        onClick={() => copyToClipboard(selectedOrder.client_id, 'Client ID')}
                                                    >
                                                        <IoCopy className="me-1" />
                                                        Копировать ID
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Дополнительная информация */}
                                {selectedOrder.address && (
                                    <div className="mb-3">
                                        <strong>📍 Адрес:</strong>
                                        <p className="mb-0">{selectedOrder.address}</p>
                                    </div>
                                )}

                                {selectedOrder.city && (
                                    <div className="mb-3">
                                        <strong>🏙️ Город:</strong>
                                        <p className="mb-0">{selectedOrder.city}</p>
                                    </div>
                                )}

                                {/* Предупреждение о конфиденциальности */}
                                <div className="alert alert-warning d-flex align-items-start" role="alert">
                                    <IoWarning className="me-2 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h6 className="alert-heading mb-2">Важно!</h6>
                                        <p className="mb-2">
                                            <strong>Номер телефона</strong> не должен передаваться другим менеджерам или третьим лицам.
                                        </p>
                                        <p className="mb-0">
                                            Для внутренней коммуникации и передачи информации о клиенте используйте <strong>Client ID: #c{selectedOrder.client_id || 'N/A'}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для передачи заказа */}
            {showTransferModal && selectedOrderForTransfer && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeTransferModal}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">
                                    <IoArrowForward className="me-2" />
                                    Передать заказ в другую команду
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeTransferModal}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h6 className="text-muted">Заказ #{selectedOrderForTransfer.leadId || selectedOrderForTransfer.order_id}</h6>
                                    <h5>{selectedOrderForTransfer.leadName || 'Имя не указано'}</h5>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: getStatusColor(selectedOrderForTransfer.text_status),
                                            color: '#000'
                                        }}
                                    >
                                        {selectedOrderForTransfer.text_status} {selectedOrderForTransfer.transfer_status}
                                    </span>
                                </div>

                                {/* Выбор команды */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Выберите команду для передачи:</label>
                                    <select
                                        className="form-select"
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                    >
                                        <option value="">-- Выберите команду --</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Информация о заказе */}
                                <div className="card bg-light mb-4">
                                    <div className="card-body">
                                        <h6 className="card-title">Детали заказа:</h6>
                                        <div className="row">
                                            <div className="col-6">
                                                <small className="text-muted">Client ID:</small>
                                                <div className="fw-bold">#c{selectedOrderForTransfer.client_id}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Сумма:</small>
                                                <div className="fw-bold text-success">${selectedOrderForTransfer.total || 0}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted">Адрес:</small>
                                            <div>{selectedOrderForTransfer.address || selectedOrderForTransfer.city || 'Не указан'}</div>
                                        </div>
                                        <div className="mt-3">
                                            <label className="form-label fw-bold">Заметка (необязательно):</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Добавьте комментарий к передаче заказа..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Показ ошибки передачи */}
                                {transferError && (
                                    <div className="alert alert-danger" role="alert">
                                        <IoWarning className="me-2" />
                                        <strong>Ошибка передачи:</strong> {transferError}
                                    </div>
                                )}

                                {/* Предупреждение */}
                                <div className="alert alert-warning" role="alert">
                                    <IoWarning className="me-2" />
                                    <strong>Внимание!</strong> После передачи заказ будет перемещен в выбранную команду и станет недоступен для редактирования.
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeTransferModal}
                                    disabled={giveOrder === selectedOrderForTransfer?.order_id}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={handleTransfer}
                                    disabled={!selectedTeam || giveOrder === selectedOrderForTransfer?.order_id}
                                >
                                    {giveOrder === selectedOrderForTransfer?.order_id ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Передача...
                                        </>
                                    ) : (
                                        <>
                                            <IoArrowForward className="me-1" />
                                            Передать заказ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnOrders;