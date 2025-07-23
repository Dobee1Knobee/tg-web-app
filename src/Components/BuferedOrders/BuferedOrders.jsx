import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    IoArrowBack,
    IoRefresh,
    IoLocation,
    IoPerson,
    IoCalendar,
    IoCard,
    IoCheckmarkCircle,
    IoTimeOutline,
    IoWarning,
    IoIdCard,
    IoDownload,
    IoTime,
    IoTrophy,
    IoAlertCircle
} from 'react-icons/io5';
// import Header from '../Header/Header';
// import { useTelegram } from "../../hooks/useTelegram";

const BufferOrdersPage = () => {
    const navigate = useNavigate();
    // const { user } = useTelegram();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [takingOrder, setTakingOrder] = useState(null);
    const [selectedOrderForTake, setSelectedOrderForTake] = useState(null);
    const [showTakeModal, setShowTakeModal] = useState(false);

    // Демо данные - в реальном приложении получать из контекста/пропсов
    const [userTeam, setUserTeam] = useState('A');
    const [userAt, setUserAt] = useState('testuser');
    // const telegramUsername = user?.username?.toLowerCase() || "devapi1";

    const mapTeamToQuery = (team) => {
        switch (team) {
            case 'A': return 'TEAM1';
            case 'B': return 'TEAM2';
            case 'C': return 'TEAM3';
            case 'W': return 'TEAM11';
            default: return 'TEAM1';
        }
    };

    const fetchBufferOrders = async () => {
        if (!userTeam) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/buffer-orders/${mapTeamToQuery(userTeam)}`);

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    if (errorData.error === "Нет заказов в буфере") {
                        setOrders([]);
                        return;
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error('Ошибка при загрузке заказов:', err);
            setError(err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeOrder = async (order) => {
        setTakingOrder(order.order_id);

        try {
            const response = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/takeOrder/${order.order_id}/${userAt}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при взятии заказа');
            }

            // Убираем заказ из списка после успешного взятия
            setOrders(prev => prev.filter(o => o.order_id !== order.order_id));

        } catch (err) {
            console.error('Ошибка при взятии заказа:', err);
            alert(`Ошибка: ${err.message}`);
        } finally {
            setTakingOrder(null);
        }
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

    const formatTransferDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) {
            return `${diffMins} мин назад`;
        } else if (diffHours < 24) {
            return `${diffHours} ч назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    };

    const openTakeModal = (order) => {
        setSelectedOrderForTake(order);
        setShowTakeModal(true);
    };

    const closeTakeModal = () => {
        setShowTakeModal(false);
        setSelectedOrderForTake(null);
    };

    const handleRefresh = () => {
        fetchBufferOrders();
    };

    useEffect(() => {
        fetchBufferOrders();
    }, [userTeam]);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && showTakeModal) {
                closeTakeModal();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showTakeModal]);

    if (loading) {
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
                    {/* <div className="row gap-3">
                        <Header />
                    </div> */}
                </div>
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Загружаем буфер заказов...</p>
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
                    {/* <div className="row gap-3">
                        <Header />
                    </div> */}
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
                {/* <div className="row gap-3">
                    <Header />
                </div> */}
            </div>

            <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">
                        <IoTrophy className="me-2 text-warning" />
                        Буфер заказов команды {userTeam}
                    </h2>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <IoRefresh className="me-1" />
                        Обновить
                    </button>
                </div>

                {/* Демо контролы */}
                <div className="alert alert-warning mb-4" role="alert">
                    <IoWarning className="me-2" />
                    <strong>Демо контролы</strong> (в реальном приложении данные приходят из контекста):
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <label className="form-label">Команда:</label>
                            <select
                                value={userTeam}
                                onChange={(e) => setUserTeam(e.target.value)}
                                className="form-select form-select-sm"
                            >
                                <option value="A">Команда A</option>
                                <option value="B">Команда B</option>
                                <option value="C">Команда C</option>
                                <option value="W">Команда W</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Username:</label>
                            <input
                                type="text"
                                value={userAt}
                                onChange={(e) => setUserAt(e.target.value)}
                                className="form-control form-control-sm"
                                placeholder="telegram username"
                            />
                        </div>
                    </div>
                </div>

                {/* Статистика */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card text-center h-100 border-primary">
                            <div className="card-body">
                                <h5 className="card-title text-primary">
                                    <IoCard className="me-2" />
                                    Всего в буфере
                                </h5>
                                <h3 className="text-primary mb-0">{orders.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center h-100 border-info">
                            <div className="card-body">
                                <h5 className="card-title text-info">
                                    <IoTime className="me-2" />
                                    Ожидают
                                </h5>
                                <h3 className="text-info mb-0">{orders.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center h-100 border-success">
                            <div className="card-body">
                                <h5 className="card-title text-success">
                                    <IoDownload className="me-2" />
                                    Доступны для взятия
                                </h5>
                                <h3 className="text-success mb-0">{orders.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Список заказов */}
                {orders.length > 0 ? (
                    <div className="row">
                        {orders.map((order, index) => (
                            <div key={order.order_id || index} className="col-md-6 mb-4">
                                <div className="card h-100 shadow-sm border-warning">
                                    <div className="card-header d-flex justify-content-between align-items-center bg-warning bg-opacity-25">
                                        <div>
                                            <strong>ID: {order.order_id || 'N/A'}</strong>
                                        </div>
                                        <span className="badge bg-warning text-dark">
                                            В буфере
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        {/* Информация о передаче */}
                                        <div className="mb-3 p-2 bg-light rounded">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <small className="text-muted">
                                                    <IoPerson className="me-1" />
                                                    Передал: {order.transferred_from?.user_name || 'Неизвестно'} из команды {order.transferred_from?.team}
                                                </small>
                                                <small className="text-muted">
                                                    <IoTimeOutline className="me-1" />
                                                    {formatTransferDate(order.transferred_from?.date)}
                                                </small>
                                            </div>
                                        </div>

                                        <h5 className="card-title">
                                            <IoPerson className="me-2 text-primary" />
                                            {order.name || order.leadName || 'Не указано'}
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

                                        {/* Услуги */}
                                        {order.services && order.services.length > 0 && (
                                            <div className="mb-3">
                                                <h6 className="text-muted mb-2">Услуги:</h6>
                                                <div className="small">
                                                    {order.services.slice(0, 2).map((service, idx) => (
                                                        <div key={idx} className="d-flex justify-content-between mb-2 p-2 border rounded">
                                                            <div className="flex-grow-1">
                                                                <div className="fw-bold">{service.label || service}</div>
                                                                <small className="text-muted">Количество: {service.count || 1}</small>
                                                            </div>
                                                            <div className="text-end">
                                                                <div className="fw-bold text-primary">
                                                                    ${(service.price || 0) * (service.count || 1)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.services.length > 2 && (
                                                        <small className="text-muted">
                                                            ...и еще {order.services.length - 2} услуг
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Заметка о передаче */}
                                        {order.transfer_note && (
                                            <div className="mb-3">
                                                <div className="card bg-info-subtle">
                                                    <div className="card-body p-2">
                                                        <small className="fw-bold text-info">Заметка при передаче:</small>
                                                        <div className="small">{order.transfer_note}</div>
                                                    </div>
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
                                                className="btn btn-success btn-sm"
                                                onClick={() => openTakeModal(order)}
                                                disabled={takingOrder === order.order_id}
                                                title="Взять заказ"
                                            >
                                                {takingOrder === order.order_id ? (
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <IoDownload className="me-1" />
                                                        Взять
                                                    </>
                                                )}
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
                            <IoCheckmarkCircle size={64} className="text-success" />
                        </div>
                        <h4 className="text-muted">Буфер пуст</h4>
                        <p className="text-muted">
                            В данный момент нет заказов для команды {userTeam}
                        </p>
                        <p className="text-muted small">
                            Заказы появятся здесь, когда их передадут другие пользователи
                        </p>
                    </div>
                )}
            </div>

            {/* Модальное окно для взятия заказа */}
            {showTakeModal && selectedOrderForTake && (
                <div
                    className="modal fade show"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeTakeModal}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    <IoDownload className="me-2" />
                                    Взять заказ из буфера
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeTakeModal}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h6 className="text-muted">Заказ #{selectedOrderForTake.order_id}</h6>
                                    <h5>{selectedOrderForTake.name || selectedOrderForTake.leadName || 'Имя не указано'}</h5>
                                    <span className="badge bg-warning text-dark">
                                        Из буфера команды {mapTeamToQuery(userTeam)}
                                    </span>
                                </div>

                                {/* Информация о передаче */}
                                <div className="alert alert-info mb-4" role="alert">
                                    <IoAlertCircle className="me-2" />
                                    <strong>Передан пользователем:</strong> {selectedOrderForTake.transferred_from?.user_name || 'Неизвестно'}
                                    <br />
                                    <small className="text-muted">
                                        {formatTransferDate(selectedOrderForTake.transferred_from?.date)}
                                    </small>
                                </div>

                                {/* Информация о заказе */}
                                <div className="card bg-light mb-4">
                                    <div className="card-body">
                                        <h6 className="card-title">Детали заказа:</h6>
                                        <div className="row">
                                            <div className="col-6">
                                                <small className="text-muted">Client ID:</small>
                                                <div className="fw-bold">#c{selectedOrderForTake.client_id}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Сумма:</small>
                                                <div className="fw-bold text-success">${selectedOrderForTake.total || 0}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted">Адрес:</small>
                                            <div>{selectedOrderForTake.address || selectedOrderForTake.city || 'Не указан'}</div>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted">Дата визита:</small>
                                            <div>{formatDate(selectedOrderForTake.date)}</div>
                                        </div>
                                        {selectedOrderForTake.master && (
                                            <div className="mt-2">
                                                <small className="text-muted">Мастер:</small>
                                                <div>{selectedOrderForTake.master}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Заметка о передаче */}
                                {selectedOrderForTake.transfer_note && (
                                    <div className="alert alert-secondary mb-4" role="alert">
                                        <strong>📝 Заметка при передаче:</strong>
                                        <br />
                                        <span className="fst-italic">{selectedOrderForTake.transfer_note}</span>
                                    </div>
                                )}

                                {/* Предупреждение */}
                                <div className="alert alert-warning" role="alert">
                                    <IoWarning className="me-2" />
                                    <strong>Внимание!</strong> После взятия заказ будет закреплен за вами и станет доступен в разделе "Мои заказы".
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeTakeModal}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => {
                                        handleTakeOrder(selectedOrderForTake);
                                        closeTakeModal();
                                    }}
                                    disabled={takingOrder === selectedOrderForTake.order_id}
                                >
                                    {takingOrder === selectedOrderForTake.order_id ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Взятие...
                                        </>
                                    ) : (
                                        <>
                                            <IoDownload className="me-1" />
                                            Взять заказ
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

export default BufferOrdersPage;