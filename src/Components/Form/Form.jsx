import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import 'bootstrap/dist/css/bootstrap.min.css';

const Form = () => {
    const { user } = useTelegram();
    const owner = user?.username || "Неизвестный";
    const [status, setStatus] = useState("В работе");
    const [tvs, setTvs] = useState([]);
    const [currentTv, setCurrentTv] = useState({ diagonal: "40", workType: "Установка" });
    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    const handleStatusChange = (e) => setStatus(e.target.value);

    const handleTvChange = (e) => {
        setCurrentTv({ ...currentTv, [e.target.name]: e.target.value });
    };

    const startAdding = () => {
        setCurrentTv({ diagonal: "40", workType: "Установка" });
        setEditIndex(null);
        setIsAdding(true);
    };

    const saveTv = () => {
        if (editIndex !== null) {
            setTvs(tvs.map((tv, i) => (i === editIndex ? currentTv : tv)));
        } else {
            setTvs([...tvs, currentTv]);
        }
        setIsAdding(false);
        setCurrentTv({ diagonal: "40", workType: "Установка" });
        setEditIndex(null);
    };

    const editTv = (index) => {
        setCurrentTv(tvs[index]);
        setEditIndex(index);
        setIsAdding(true);
    };

    const removeTv = (index) => {
        setTvs(tvs.filter((_, i) => i !== index));
    };

    return (
        <div className="container py-4">
            <h2 className="mb-3">Создание новой заявки</h2>

            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Номер лида" />
            </div>

            <div className="mb-3">
                <input className="form-control" placeholder={`Владелец заявки: ${owner}`} readOnly />
            </div>

            <div className="mb-3">
                <label className="form-label">Статус заявки</label>
                <select className="form-select" value={status} onChange={handleStatusChange}>
                    <option>В работе</option>
                    <option>Другой регион</option>
                    <option>Невалидный</option>
                    <option>Недозвон</option>
                    <option>Ночной</option>
                    <option>Ночной ранний</option>
                    <option>Нужно подтверждение</option>
                    <option>Нужно согласование</option>
                    <option>Оформлен</option>
                    <option>Прозвонить завтра</option>
                    <option>Статус заказа</option>
                </select>
            </div>

            <button className="btn btn-primary" onClick={startAdding}>Добавить телевизор</button>

            {isAdding && (
                <div className="card my-3 p-3">
                    <div className="mb-3">
                        <label className="form-label">Диагональ телевизора</label>
                        <select className="form-select" name="diagonal" value={currentTv.diagonal} onChange={handleTvChange}>
                            <option>30</option>
                            <option>40</option>
                            <option>50</option>
                            <option>60</option>
                            <option>70</option>
                            <option>80</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Вид работы</label>
                        <select className="form-select" name="workType" value={currentTv.workType} onChange={handleTvChange}>
                            <option>Установка</option>
                            <option>Демонтаж</option>
                            <option>Настройка</option>
                        </select>
                    </div>

                    <button className="btn btn-success" onClick={saveTv}>
                        {editIndex !== null ? "Сохранить изменения" : "Добавить"}
                    </button>
                </div>
            )}

            {tvs.length > 0 && (
                <div className="mt-4">
                    <h4>Добавленные телевизоры:</h4>
                    <ul className="list-group">
                        {tvs.map((tv, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>📺 Диагональ: <b>{tv.diagonal}"</b>, Вид работы: <b>{tv.workType}</b></span>
                                <div className="btn-group">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => editTv(index)}>Редактировать</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeTv(index)}>Удалить</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Form;
