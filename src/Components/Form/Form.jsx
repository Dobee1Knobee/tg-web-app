import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import './Form.css';

const Form = () => {
    const { user } = useTelegram();
    const owner = user?.username || "Неизвестный";

    const [status, setStatus] = useState("В работе");

    const onChangeStatus = (e) => {
        setStatus(e.target.value);
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Создание новой заявки</h2>

            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Номер лида"
                />
            </div>

            <div className="mb-3">
                <input
                    className="form-control"
                    placeholder={`Владелец заявки: ${owner}`}
                    readOnly
                />
            </div>

            <div className="mb-3 d-flex align-items-center gap-3">
                <label className="form-label text-nowrap mb-0">Статус заявки</label>
                <select
                    value={status}
                    onChange={onChangeStatus}
                    className="form-select"
                >
                    <option value="В работе">В работе</option>
                    <option value="Другой регион">Другой регион</option>
                    <option value="Невалидный">Невалидный</option>
                    <option value="Недозвон">Недозвон</option>
                    <option value="Ночной">Ночной</option>
                    <option value="Ночной ранний">Ночной ранний</option>
                    <option value="Нужно подтверждение">Нужно подтверждение</option>
                    <option value="Нужно согласование">Нужно согласование</option>
                    <option value="Оформлен">Оформлен</option>
                    <option value="Прозвонить завтра">Прозвонить завтра</option>
                    <option value="Статус заказа">Статус заказа</option>
                </select>
            </div>

            <button className="btn btn-primary">Добавить телевизор</button>

            {/* Остальной код закомментирован, можешь вернуть если нужно */}
            {/*
            <div className="mt-3">
                <h2>Какая диагональ телевизора</h2>
                <select className="form-select">
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="60">60</option>
                    <option value="70">70</option>
                    <option value="80">80</option>
                </select>
            </div>

            <div className="mt-3">
                <h2>Количество</h2>
                <input type="number" className="form-control" />
            </div>
            */}
        </div>
    );
};

export default Form;
