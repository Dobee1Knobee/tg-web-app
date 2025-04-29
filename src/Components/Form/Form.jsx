import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import 'bootstrap/dist/css/bootstrap.min.css';

const workTypes = [
    { label: "Compensation for Distance to Customers", value: "miles" },
    { label: "Local TV Transport", value: "transport" },
    { label: "On stand / On existing Mounting", value: "tv_stand" },
    { label: "Standard Mounting", value: "tv_std" },
    { label: "Large TV Mounting", value: "tv_big" },
    { label: "Frame TV Mounting", value: "tv_frame" },
    { label: "Fireplace Installation", value: "firepalce" },
    { label: "Mantel Mount TV Installation", value: "tv_mantle" },
    { label: "Mounting on Solid Surfaces or Ceiling", value: "solid" },
    { label: "TV Unmounting", value: "unmt" },
    { label: "Cable Channel Installation", value: "ext" },
    { label: "Wire Removal (behind wall)", value: "int" },
    { label: "Cable management", value: "cbl_mng" },
    { label: "Soundbar Installation", value: "sb" },
    { label: "Outlet Installation", value: "outlet" },
    { label: "Shelf Installation", value: "shelf" },
    { label: "Painting and Picture Hanging", value: "painting" },
    { label: "TV Backlight Installation", value: "backlight" },
    { label: "PS/XBOX Installation", value: "xbox" },
    { label: "Furniture Assembly (hourly)", value: "hours" },
    { label: "Addons", value: "addons" },

];

const Form = () => {
    const { user } = useTelegram();
    const owner = user?.username || "Неизвестный";

    const [status, setStatus] = useState("");
    const [leadName, setLeadName] = useState("");
    const [leadId, setLeadId] = useState("");
    const [services, setServices] = useState([]);
    const [currentService, setCurrentService] = useState({ diagonal: "40", workType: workTypes[0].value,    message: "",
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [message, setMessage] = useState("");
    const handleStatusChange = (e) => setStatus(e.target.value);
    const handleServiceChange = (e) => {
        setCurrentService({ ...currentService, [e.target.name]: e.target.value });
    };
    const startAdding = () => {
        setCurrentService({ diagonal: "40", workType: workTypes[0].value });
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
        setCurrentService({ diagonal: "40", workType: workTypes[0].value });
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
                <input className="form-control" type="text" placeholder="Номер лида" value={leadId} onChange={(e) => setLeadId(e.target.value)} />
            </div>

            <div className="mb-3">
                <input className="form-control" placeholder={`Владелец заявки: ${owner}`} readOnly />
            </div>

            <div className="mb-3">
                <select className="form-select" value={status} onChange={handleStatusChange}>
                    <option value="" disabled hidden>Статус заявки</option>
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

            <div className="mb-3">
                <input className="form-control" type="text" placeholder="Имя заказчика" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
            </div>

            <button className="btn btn-primary" onClick={startAdding}>Добавить услугу</button>

            {isAdding && (
                <div className="card my-3 p-3">
                    <div className="mb-3">
                        <label className="form-label">Диагональ телевизора</label>
                        <select className="form-select" name="diagonal" value={currentService.diagonal} onChange={handleServiceChange}>
                            {["30", "40", "50", "60", "70", "80"].map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3 d-flex flex-row gap-3">
                        <select className="form-select" name="workType" value={currentService.workType} onChange={handleServiceChange}>
                            {workTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <input type={"number"} placeholder={"Стоимость"} style={{width:"40%",textAlign:"center"}}/>
                    </div>
                    <div className={"mb-3"}>
                        <input name={"message"} className={"form-control"} type={"text"} placeholder={"Дополнительная информация"}    value={currentService.message}
                               onChange={handleServiceChange} />
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
                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                📺 Диагональ: <b>{s.diagonal}"</b>,
                                Работа: <b>{workTypes.find(t => t.value === s.workType)?.label}</b>
                                {s.message && (<div>📝 Комментарий: {s.message}</div>)}
                            </span>
                                <div className="btn-group">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => editService(i)}>Редактировать</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeService(i)}>Удалить</button>
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
