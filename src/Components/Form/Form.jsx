import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import 'bootstrap/dist/css/bootstrap.min.css';
const workTypes = [
    { label: "On stand / On existing Mounting", value: "tv_stand", price: 0 }, // не указано
    { label: "Standard Mounting", value: "tv_std", price: 39 }, // Fixed
    { label: "Large TV Mounting", value: "tv_big", price: 149 }, // 60”+ one handyman
    { label: "Large TV Mounting 2 handyman", value: "tv_big2", price: 189 }, // 60”+ two handyman
    { label: "Frame TV Mounting", value: "tv_frame", price: 0 },
    { label: "Fireplace Installation", value: "firepalce", price: 49 }, // Above the fireplace
    { label: "Mantel Mount TV Installation", value: "tv_mantle", price: 69 }, // Full motion (предположительно)
    { label: "Mounting on Solid Surfaces or Ceiling", value: "solid", price: 49 }, // Stone wall
    { label: "TV Unmounting", value: "unmt", price: 49 }, // Dismount
    { label: "Cable Channel Installation", value: "ext", price: 49 }, // Cord concealment (external)
    { label: "Wire Removal (behind wall)", value: "int", price: 99 }, // Cord concealment (internal)
    { label: "Cable management", value: "cbl_mng", price: 0 },
    { label: "Soundbar Installation", value: "sb", price: 69 }, // Soundbar
    { label: "Outlet Installation", value: "outlet", price: 59 }, // Install outlet
    { label: "Shelf Installation", value: "shelf", price: 49 }, // Install wall shelf
    { label: "Painting and Picture Hanging", value: "painting", price: 0 }, // не указано
    { label: "TV Backlight Installation", value: "backlight", price: 149 },
    { label: "PS/XBOX Installation", value: "xbox", price: 69 },
    { label: "Furniture Assembly (hourly)", value: "hours", price: 0 }, // зависит от часов
    { label: "Addons", value: "addons", price: 0 }, // не указано
];

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
};


const Form = () => {
    const { user } = useTelegram();
    const owner = user?.username || "Неизвестный";

    const [status, setStatus] = useState("");
    const [leadName, setLeadName] = useState("");
    const [leadId, setLeadId] = useState("");
    const [services, setServices] = useState([]);
    const [currentService, setCurrentService] = useState({
        diagonal: "",
        count: "1",
        workType: workTypes[0].value,
        message: "",
        price: "",
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    const handleStatusChange = (e) => setStatus(e.target.value);

    const handleServiceChange = (e) => {
        setCurrentService({ ...currentService, [e.target.name]: e.target.value });
    };

    const startAdding = () => {
        setCurrentService({
            diagonal: "",
            count: "1",
            workType: workTypes[0].value,
            message: "",
            price: "",
        });
        setEditIndex(null);
        setIsAdding(true);
    };

    const saveService = () => {
        if (editIndex !== null) {
            setServices(services.map((item, i) => (i === editIndex ? currentService : item)));
        } else {
            setServices([...services, currentService]);
        }
        setIsAdding(false);
        setCurrentService({
            diagonal: "",
            count: "1",
            workType: workTypes[0].value,
            message: "",
            price: "",
        });
        setEditIndex(null);
    };

    const editService = (index) => {
        setCurrentService(services[index]);
        setEditIndex(index);
        setIsAdding(true);
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

    return (
        <div className="container py-4">
            <h2 className="mb-3 text-center mt-4">Создание новой заявки</h2>

            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Номер лида"
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <input className="form-control" placeholder={`Владелец заявки: ${owner}`} readOnly />
            </div>

            <div className="mb-3">
                <select
                    className="form-select"
                    value={status}
                    onChange={handleStatusChange}
                    style={{
                        backgroundColor: statusColors[status] || "#fff",
                        color: status === "" ? "#6c757d" : "#000",
                        fontWeight: "bold"
                    }}
                >
                    <option value="" disabled hidden>
                        Статус заявки
                    </option>
                    {Object.keys(statusColors).map((statusKey) => (
                        <option key={statusKey} value={statusKey}>
                            {statusKey}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Имя заказчика"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={startAdding}>
                Добавить услугу
            </button>

            {isAdding && (
                <div className="card my-3 p-3">
                    <div className="mb-3 d-flex flex-row gap-3">

                        <input
                            className="form-control"
                            name="diagonal"
                            value={currentService.diagonal}
                            onChange={(e) => setCurrentService({ ...currentService, diagonal: e.target.value.replace(/\D/g, '') })}
                            type="text"
                            placeholder="Диагональ"

                        />
                        <input className="form-control" name={"count"} type="number" placeholder={"Количество"} value={currentService.count} onChange={(e => setCurrentService({...currentService,count: e.target.value.replace(/\D/g, '')}))}  style={{ width: "40%", textAlign: "center" } }
                        />
                    </div>

                    <div className="mb-3 d-flex flex-row gap-3">
                        <select
                            className="form-select"
                            name="workType"
                            value={currentService.workType}
                            onChange={handleServiceChange}
                        >
                            {workTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="price"
                            placeholder="Стоимость"
                            min="0"
                            className="form-control"
                            style={{ width: "40%", textAlign: "center" }}
                            value={currentService.price}
                            onChange={handleServiceChange}

                        />
                    </div>

                    <div className="mb-3">
                        <input
                            name="message"
                            className="form-control"
                            type="text"
                            placeholder="Дополнительная информация"
                            value={currentService.message}
                            onChange={handleServiceChange}
                        />
                    </div>

                    <button className="btn btn-success" onClick={saveService}>
                        {editIndex !== null ? "Сохранить изменения" : "Добавить"}
                    </button>
                </div>
            )}

            {services.length > 0 && (
                <div className="mt-4">
                    <h4>Добавленные услуги:</h4>
                    <ul className="list-group">
                        {services.map((s, i) => (
                            <li
                                key={i}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>
                                    📺  Диагональ: <b>{s.diagonal}"</b> <br/>
                                    🔢  Количество: <b>{s.count}</b> <br/>
                                    🔧  Услуга: <b>{workTypes.find(t => t.value === s.workType)?.label}</b><br/>
                                    {s.price && <>💵 Стоимость  <b>{s.price} $</b></>}
                                    {s.message && <div>📝 Комментарий: {s.message}</div>}
                                </span>
                                <div className="btn-group">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => editService(i)}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeService(i)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Общая сумма */}
                    <div className="text-end mt-3">
                        <h5>
                            💰 Общая сумма:{" "}
                            <b>
                                {services
                                    .map((s) => Number(s.price * s.count) || 0)
                                    .reduce((a, b) => a + b, 0)
                                    .toLocaleString()} $
                            </b>
                        </h5>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Form;
