import React, { useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import 'bootstrap/dist/css/bootstrap.min.css';
const workTypes = [
     { label: "Standard Mounting", value: "tv_std", price: 0 }, // зависит от часов
    { label: "Large Mounting", value: "tv_big", price: 0 }, // зависит от часов
    { label:  "Large Mounting 2 Handy", value: "tv_big2", price: 0 }, // зависит от часов
];
const additionalServices = [
    { label: "Dismount an existing TV", value: "unmount_tv", price: 49 },
    { label: "Cord concealment (external)", value: "cord_external", price: 49 },
    { label: "Cord concealment (internal)", value: "cord_internal", price: 99 },
    { label: "Above the fireplace", value: "fireplace", price: 49 },
    { label: "Stone wall", value: "stone_wall", price: 49 },
    { label: "Soundbar", value: "soundbar", price: 79 },
    { label: "Install wall shelf", value: "shelf", price: 49 },
    { label: "Xbox, PlayStation", value: "xbox", price: 69 },
    { label: "Electric fireplace mounting", value: "electric_fireplace", price: 80 },
    { label: "Install an electrical outlet", value: "outlet", price: 59 },
    { label: "Soundbar with installation", value: "soundbar_full", price: 199 },
    { label: "TV backlight installation", value: "backlight", price: 149 },
];
const mount = [
    {label:"Fixed TV mount",value:"fixed_mount",price:39},
    {label:"Titling Mounting", value: "titling_mount",price:49},
    {label:"Full Motion", value: "full_motion",price:69},
]
const materialsList = [
    { label: "Brush wall plate", value: "brush_plate", price: 6 },
    { label: "Cable channel rack", value: "cable_channel", price: 6 },
    { label: "6ft extension cord", value: "ext6", price: 8 },
    { label: "12ft extension cord", value: "ext12", price: 14 },
    { label: "Soundbar mount", value: "soundbar_mount", price: 21 },
    { label: "Xbox, PlayStation mount", value: "xbox_mount", price: 35 },
    { label: "HDMI cable 118″", value: "hdmi_118", price: 14 },
    { label: "HDMI cable 196″", value: "hdmi_196", price: 24 },
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
    const [showTechChoice, setShowTechChoice] = useState(false);
    const [status, setStatus] = useState("");
    const [leadName, setLeadName] = useState("");
    const [leadId, setLeadId] = useState("");
    const [services, setServices] = useState([]);
    const [customTotal, setCustomTotal] = useState(null);
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [materialCount, setMaterialCount] = useState(1);
    const [isAddingAddons, setIsAddingAddons] = useState(false);
    const [selectedAddon, setSelectedAddon] = useState(null);
    const [addonCount, setAddonCount] = useState(1);

    const [currentService, setCurrentService] = useState({
        diagonal: "",
        count: "1",
        workType: workTypes[0].value,
        message: "",
        price: "",
        mountType: "",
        mountPrice: 0,
        addons : [],
        addonsPrice: 0,
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isAddingMaterials, setIsAddingMaterials] = useState(false);
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
            mountType: "",
            mountPrice: 0,
            materials: [],
            materialPrice:0,
            addons : [],
            addonsPrice: 0
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
            mountType: "",
            mountPrice: 0,
            addons : [],
            addonsPrice: 0,
        });
        setCustomTotal(null);
        setIsEditingTotal(false);
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
                    <div className=" p-3 position-relative">
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 "
                            aria-label="Close"
                            onClick={() => setIsAdding(false)} // закрыть форму добавления
                        ></button>

                        {/* Здесь остальной контент карточки */}
                    </div>

                    <div className="mb-3 d-flex flex-row gap-3">

                        <input
                            className="form-control"
                            name="diagonal"
                            value={currentService.diagonal}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                const num = Number(val);

                                let autoType = currentService.workType;
                                let autoPrice = currentService.price;

                                if (num <= 31) {
                                    autoType = "tv_std";
                                    autoPrice = 69;
                                    setShowTechChoice(false)
                                } else if (num >= 32 && num <= 59) {
                                    autoType = "tv_std";
                                    autoPrice = 129;
                                    setShowTechChoice(false)
                                } else if (num >= 60) {

                                    setShowTechChoice(true);
                                }

                                setCurrentService({
                                    ...currentService,
                                    diagonal: val,
                                    workType: autoType,
                                    price: autoPrice,
                                });
                            }}
                            type="text"
                            placeholder="Диагональ"
                        />

                        <input
                            className="form-control"
                            name={"count"}
                            type="number"
                            min={1}
                            placeholder={"Количество"}
                            value={currentService.count}
                            onChange={(e) =>
                                setCurrentService({
                                    ...currentService,
                                    count: e.target.value.replace(/\D/g, ''),
                                })
                            }
                            style={{ width: "30%", textAlign: "center" }}
                        />
                    </div>
                    {showTechChoice && (
                        <div className="mb-3 d-flex flex-row gap-3 justify-content-center">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    setCurrentService({
                                        ...currentService,
                                        workType: "tv_big",
                                        price: 149,
                                    });
                                    setShowTechChoice(false);
                                }}
                            >
                                Один техник ($149)
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => {
                                    setCurrentService({
                                        ...currentService,
                                        workType: "tv_big2",
                                        price: 189,
                                    });
                                    setShowTechChoice(false);
                                }}
                            >
                                Два техника ($189)
                            </button>
                        </div>
                    )}

                    <div className="mb-3 d-flex flex-row gap-3">

                        <div className="form-control" style={{ backgroundColor: "#f8f9fa" }}>
                            {workTypes.find(w => w.value === currentService.workType)?.label || "—"}
                        </div>


                        <div className="form-control" style={{ backgroundColor: "#f8f9fa",width:"30%",textAlign: "center" }}>
                            {currentService.price + "$"}
                        </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row gap-3 mb-3 align-items-stretch justify-content-center">
                        <button className={"btn btn-primary"} onClick={e => setIsAddingMaterials(true)}>Дополнительные материалы</button>
                        <button className={"btn btn-warning"} onClick={e => setIsAddingAddons(true)}>Дополнительные услуги</button>
                        <select
                            className="form-select"
                            name="mountType"
                            value={currentService.mountType}
                            onChange={(e) => {
                                const value = e.target.value;

                                const selectedMount = mount.find(m => m.value === value);
                                setCurrentService({
                                    ...currentService,
                                    mountType: value,
                                    mountPrice: selectedMount?.price  || 0,
                                });

                            }}
                        >
                            <option value="">Тип крепления</option>
                            <option value="fixed_mount">Fixed — $39</option>
                            <option value="titling_mount">Tilting — $49</option>
                            <option value="full_motion">Full motion — $69</option>
                        </select>

                    </div>
                    {isAddingAddons && (
                        <div className=" card p-3 text-center mb-3">
                            <div className=" p-3 position-relative">
                                <button
                                    type="button"
                                    className="btn-close position-absolute top-0 end-0 "
                                    aria-label="Close"
                                    onClick={() => setIsAddingAddons(false)} // закрыть форму добавления
                                ></button>
                            </div>
                            <h5>Выберите услуги</h5>
                            <div className={"d-flex flex-column flex-md-row gap-3 mb-3 align-items-stretch justify-content-center"}>
                                <select
                                    className="form-select"
                                    onChange={(e) => {
                                        const addon = additionalServices.find(m => m.value === e.target.value);
                                        setSelectedAddon(addon || null);
                                    }}
                                >
                                    <option value="">Выберите материал</option>
                                    {additionalServices.map((m, i) => (
                                        <option key={i} value={m.value}>{m.label} — {m.price}$</option>
                                    ))}
                                </select>
                                <input
                                    className="form-control"
                                    type="number"

                                    value={addonCount}
                                    min={1}
                                    onChange={(e) => setAddonCount(Number(e.target.value))}
                                    style={{ width: "20%", textAlign: "center" }}
                                />
                            </div>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                    if (!selectedAddon) return;
                                    const updatedAddons = currentService.addons || [];
                                    updatedAddons.push({
                                        ...selectedAddon,
                                        count: addonCount,
                                    });

                                    const updatedPrice = (currentService.addonsPrice || 0) + (selectedAddon.price * addonCount);

                                    setCurrentService({
                                        ...currentService,
                                        addons: updatedAddons,
                                        addonsPrice: updatedPrice,
                                    });

                                    // Сброс
                                    setSelectedAddon(null);
                                    setAddonCount(1);
                                    setIsAddingAddons(false)
                                }}
                            >
                                ➕ Добавить
                            </button>

                        </div>
                        )}
                    {isAddingMaterials && (
                        <div className=" card p-3 text-center mb-3">
                            <div className=" p-3 position-relative">
                                <button
                                    type="button"
                                    className="btn-close position-absolute top-0 end-0 "
                                    aria-label="Close"
                                    onClick={() => setIsAddingMaterials(false)} // закрыть форму добавления
                                ></button>

                                {/* Здесь остальной контент карточки */}
                            </div>
                            <h5>Выберите материалы</h5>
                            <div className={"d-flex flex-column flex-md-row gap-3 mb-3 align-items-stretch justify-content-center"}>
                                <select
                                    className="form-select"
                                    onChange={(e) => {
                                        const material = materialsList.find(m => m.value === e.target.value);
                                        setSelectedMaterial(material || null);
                                    }}
                                >
                                    <option value="">Выберите материал</option>
                                    {materialsList.map((m, i) => (
                                        <option key={i} value={m.value}>{m.label} — {m.price}$</option>
                                    ))}
                                </select>
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="1"
                                    value={materialCount}
                                    min={1}
                                    onChange={(e) => setMaterialCount(Number(e.target.value))}
                                    style={{ width: "20%", textAlign: "center" }}
                                />
                            </div>

                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                    if (!selectedMaterial) return;
                                    const updatedMaterials = currentService.materials || [];
                                    updatedMaterials.push({
                                        ...selectedMaterial,
                                        count: materialCount,
                                    });

                                    const updatedPrice = (currentService.materialPrice || 0) + (selectedMaterial.price * materialCount);

                                    setCurrentService({
                                        ...currentService,
                                        materials: updatedMaterials,
                                        materialPrice: updatedPrice,
                                    });

                                    // Сброс
                                    setSelectedMaterial(null);
                                    setMaterialCount(1);
                                    setIsAddingMaterials(false)
                                }}
                            >
                                ➕ Добавить
                            </button>

                        </div>
                    )}
                    {currentService.addons?.length > 0 && (
                        <div className="mb-3">
                            <h6>🛠️ Дополнительные услуги:</h6>
                            <ul className="list-group">
                                {currentService.addons.map((mat, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between">
                                        <span>{mat.label} × {mat.count}</span>
                                        <span>{mat.price * mat.count} $</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {currentService.materials?.length > 0 && (
                        <div className="mb-3">
                            <h6>📦 Материалы:</h6>
                            <ul className="list-group">
                                {currentService.materials.map((mat, idx) => (
                                    <li key={idx} className="list-group-item d-flex justify-content-between">
                                        <span>{mat.label} × {mat.count}</span>
                                        <span>{mat.price * mat.count} $</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                                    { s.mountType && (
                                        <div>🔩 Крепление: <b>{mount.find(m => m.value === s.mountType)?.label}</b> — 💲{s.mountPrice}</div>
                                    )}
                                    {s.price && <>💵 Стоимость  <b>{s.price} $</b></>}
                                    {s.message && <div>📝 Комментарий: {s.message}</div>}
                                    {s.materials?.length > 0 && (
                                        <div>
                                            📦 Материалы:
                                            <ul className="mb-0">
                                                {s.materials.map((mat, idx) => (
                                                    <li key={idx}>
                                                        {mat.label} × {mat.count} — ${mat.price * mat.count}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {s.addons?.length > 0 && (
                                        <div>
                                            🛠️ Дополнительные услуги:
                                            <ul className="mb-0">
                                                {s.addons.map((mat, idx) => (
                                                    <li key={idx}>
                                                        {mat.label} × {mat.count} — ${mat.price * mat.count}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}


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
                                {customTotal !== null
                                    ? `${customTotal} $`
                                    : `${services
                                        .map(s => (s.price + s.mountPrice + (s.materialPrice||0) + (s.addonsPrice||0)) * s.count)
                                        .reduce((a, b) => a + b, 0)
                                        .toLocaleString()} $`}
                            </b>
                        </h5>

                        {!isEditingTotal ? (
                            <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setIsEditingTotal(true)}>
                                Изменить вручную
                            </button>
                        ) : (
                            <div className="mt-2 d-flex flex-row gap-2 justify-content-end">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Сумма"
                                    style={{ width: "150px", textAlign: "center" }}
                                    value={customTotal || ""}
                                    onChange={(e) => setCustomTotal(e.target.value)}
                                />
                                <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                    setCustomTotal(null);
                                    setIsEditingTotal(false);
                                }}>
                                    Сбросить
                                </button>
                                <button className="btn btn-sm btn-outline-success" onClick={() => {
                                    setIsEditingTotal(false);
                                }}>
                                    Подтвердить
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default Form;
