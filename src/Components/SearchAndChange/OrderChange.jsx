import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';
import { useUserByAt } from '../../hooks/findUserByAt';
import { useMastersByTeam } from '../../hooks/findMastersByTeam';
import { useSubmitOrder } from '../../hooks/useSubmitOrders';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../Header/Header';
import { IoArrowBack } from 'react-icons/io5';

const OrderChange = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useTelegram();
    const telegramUsername = user?.username?.toLowerCase() || 'devapi1';
    const mongoUser = useUserByAt(telegramUsername);
    const { submitOrder } = useSubmitOrder();
    const [team, setTeam] = useState('');
    const [managerId, setManagerId] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerUsername, setOwnerUsername] = useState('');
    const masters = useMastersByTeam(team);
    const [loading, setLoading] = useState(!!id);

    const [status, setStatus] = useState('');
    const [leadName, setLeadName] = useState('');
    const [addressLead, setAddressLead] = useState('');
    const [phoneNumberLead, setPhoneNumberLead] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [dataLead, setDataLead] = useState(() => new Date().toISOString().slice(0, 16));
    const [city, setCity] = useState('');
    const [selectedMaster, setSelectedMaster] = useState('');
    const [commentOrder, setCommentOrder] = useState('');
    const [services, setServices] = useState([]);
    const [customTotal, setCustomTotal] = useState(null);
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [changes, setChanges] = useState([]);

    useEffect(() => {
        if (mongoUser) {
            setOwnerName(mongoUser.name);
            setOwnerUsername(`@${telegramUsername}`);
            setTeam(mongoUser.team);
            setManagerId(mongoUser.manager_id);
        } else if (telegramUsername) {
            setOwnerUsername(`@${telegramUsername}`);
        }
    }, [mongoUser, telegramUsername]);

    useEffect(() => {
        if (id) {
            fetch(`https://backend/api/order/${id}`)
                .then(res => res.json())
                .then(data => {
                    setStatus(data.status || '');
                    setLeadName(data.leadName || '');
                    setAddressLead(data.address || '');
                    setPhoneNumberLead(data.phone || '');
                    setDisplayValue(formatPhoneNumber(data.phone || ''));
                    setDataLead(data.date ? data.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
                    setCity(data.city || '');
                    setSelectedMaster(data.master || '');
                    setCommentOrder(data.comment || '');
                    setServices(data.services || []);
                    setCustomTotal(data.total || null);
                    setChanges(data.changes || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Ошибка загрузки заказа:', err);
                    setLoading(false);
                });
        }
    }, [id]);

    function formatPhoneNumber(value) {
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
    }

    const handleChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;
        setPhoneNumberLead(cleaned);
        setDisplayValue(formatPhoneNumber(input));
    };

    const handleStatusChange = (e) => setStatus(e.target.value);

    const handleSubmit = async () => {
        const now = new Date();
        const formattedDate = new Date(dataLead).toISOString();
        const payload = {
            status,
            leadName,
            address: addressLead,
            phone: phoneNumberLead,
            date: formattedDate,
            city,
            master: selectedMaster,
            comment: commentOrder,
            services,
            total: customTotal !== null ? Number(customTotal) : services
                .map(s => ((s.price + s.mountPrice) * s.count + (s.materialPrice || 0) + (s.addonsPrice || 0)))
                .reduce((a, b) => a + b, 0),
            owner: `@${telegramUsername}`,
            leadId: team + managerId,
        };

        if (id) {
            payload.changes = [
                ...(changes || []),
                {
                    date: now.toISOString(),
                    user: `@${telegramUsername}`,
                    fullSnapshot: {
                        status,
                        leadName,
                        address: addressLead,
                        phone: phoneNumberLead,
                        date: formattedDate,
                        city,
                        master: selectedMaster,
                        comment: commentOrder,
                        services,
                        total: customTotal
                    }
                }
            ];
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `https://backend/api/order/${id}` : `https://backend/api/order`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Ошибка при отправке');

            alert(id ? '✅ Заказ обновлён!' : '✅ Заявка создана!');
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('❌ Ошибка при сохранении заказа');
        }
    };

    if (loading) return <p className="text-center mt-5">Загрузка...</p>;

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

            <h2 className="mb-3 text-center mt-4">{id ? 'Редактирование заявки' : 'Создание новой заявки'}</h2>

            <div className="mb-3">
                <input className="form-control" placeholder={`Владелец заявки: ${ownerName}`} readOnly />
            </div>

            <div className="mb-3">
                <select className="form-select" value={status} onChange={handleStatusChange}>
                    <option value="" disabled hidden>Статус заявки</option>
                    {Object.entries({
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
                    }).map(([label, color]) => (
                        <option key={label} value={label} style={{ backgroundColor: color }}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Имя заказчика" value={leadName} onChange={e => setLeadName(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Адрес" value={addressLead} onChange={e => setAddressLead(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Телефон" value={displayValue} onChange={handleChange} />
            </div>
            <div className="mb-3 d-flex gap-2">
                <input className="form-control" type="date" value={dataLead.split("T")[0]} onChange={e => setDataLead(prev => `${e.target.value}T${prev.split("T")[1] || "12:00"}`)} />
                <input className="form-control" type="time" value={dataLead.split("T")[1] || "12:00"} onChange={e => setDataLead(prev => `${prev.split("T")[0]}T${e.target.value}`)} />
            </div>
            <div className="mb-3">
                <select className="form-select" value={selectedMaster} onChange={e => {
                    const val = e.target.value;
                    setSelectedMaster(val);
                    const matched = masters.find(m => m.name === val);
                    if (matched) setCity(matched.city);
                }}>
                    <option value="">Выберите мастера</option>
                    {masters?.map((m, i) => (
                        <option key={i} value={m.name}>{m.name} ({m.city})</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Город" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Комментарий к заказу" value={commentOrder} onChange={e => setCommentOrder(e.target.value)} />
            </div>

            <button className="btn btn-success w-100" onClick={handleSubmit}>
                💾 {id ? 'Сохранить изменения' : 'Создать заявку'}
            </button>
        </div>
    );
};

export default OrderChange;
