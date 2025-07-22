import React, {useEffect, useState} from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useUserByAt } from '../../hooks/findUserByAt';
import { useMastersByTeam } from '../../hooks/findMastersByTeam';
import { useSubmitOrder } from "../../hooks/useSubmitOrders";

import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "../Header/Header";
import {IoArrowBack, IoArrowBackCircle} from "react-icons/io5";
import {useNavigate} from "react-router-dom";
import { useParams } from "react-router-dom";
import {useCheckOrder} from "../../hooks/useCheckOrder";
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
function roundTimeTo5Minutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const rounded = Math.round(totalMinutes / 5) * 5;
    const hh = String(Math.floor(rounded / 60)).padStart(2, "0");
    const mm = String(rounded % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

const Form = () => {
    const [displayValue, setDisplayValue] = useState('');
    const { leadId } = useParams();
    const { response: checkResponse, error: checkError, loading, checkOrder } = useCheckOrder();

    const [isWeOwnerMount, setIsWeOwnerMount] = useState(false);
    const [mountData,setMountData] = useState({});
    const { submitOrder, isLoading, error, response } = useSubmitOrder();

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

    const handleChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');

        // Очищенный номер без +1
        const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;

        setPhoneNumberLead(cleaned); // сюда только цифры без 1
        setDisplayValue(formatPhoneNumber(input));// сюда красиво отформатированное
        checkOrder(cleaned);
    };

    const { user } = useTelegram();
    const telegramUsername = user?.username?.toLowerCase() || "devapi1";
    const mongoUser = useUserByAt(telegramUsername);
    const [team, setTeam] = useState("");
    const [managerId, setManagerId] = useState("");
    const masters = useMastersByTeam(team); // ⬅️ на верхнем уровне компонента
    const navigate = useNavigate();
    const [updateOrder,setUpdateOrder] = useState(false);

    const [ownerName, setOwnerName] = useState("");
    const [ownerUsername, setOwnerUsername] = useState("");
    useEffect(() => {
        if (mongoUser) {
            setOwnerName(mongoUser.name); // ← имя для Google Sheets
            setOwnerUsername(`@${telegramUsername}`); // ← username для Mongo
            setTeam(mongoUser.team);
            setManagerId(mongoUser.manager_id);
        } else if (telegramUsername) {
            setOwnerUsername(`@${telegramUsername}`);
        }
    }, [mongoUser, telegramUsername]);

    useEffect(() => {
        if (!leadId) return;

        fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/orderByLeadId/${leadId}`)
            .then(res => res.json())
            .then((data) => {
                setUpdateOrder(true);
                setStatus(data.text_status || "");
                setLeadName(data.leadName || "");
                setAddressLead(data.address || "");
                setPhoneNumberLead(data.phone || "");
                setDisplayValue(formatPhoneNumber(data.phone || ""));
                setCity(data.city || "");
                setCommentOrder(data.comment || "");
                setSelectedMaster(data.master || "");
                setServices(data.services || []);

                const isoDate = new Date(data.date);
                const date = isoDate.toISOString().split("T")[0];
                const time = isoDate.toTimeString().slice(0, 5);
                setDataLead(`${date}T${time}`);
            })
            .catch(err => {
                console.error("❌ Ошибка при загрузке заказа по leadId:", err);
            });
    }, [leadId]);

    const [showTechChoice, setShowTechChoice] = useState(false);
    const [status, setStatus] = useState("");
    const [leadName, setLeadName] = useState("");
    const [addressLead, setAddressLead] = useState("");
    const [phoneNumberLead,setPhoneNumberLead] = useState("");
    const [services, setServices] = useState([]);
    const [customTotal, setCustomTotal] = useState(null);
    const [isEditingTotal, setIsEditingTotal] = useState(false);

    const [isAddingAddons, setIsAddingAddons] = useState(false);

    const [selectedAddon, setSelectedAddon] = useState(null);
    const [selectedAddMaterials, setSelectedAddMaterials] = useState(null);
    const [addMaterialsCount, setAddMaterialsCount] = useState(1);
    const [city, setCity] = useState("");
    const [addonCount, setAddonCount] = useState(1);
    const [dataLead, setDataLead] = useState(() => {
        const now = new Date();
        const date = now.toISOString().split("T")[0]; // "2025-05-17"
        const time = now.toTimeString().split(":").slice(0, 2).join(":"); // "17:38"
        return `${date}T${time}`; // → "2025-05-17T17:38"
    });
    const [commentOrder,setCommentOrder] = useState("");
    const [selectedMaster, setSelectedMaster] = useState("");
    const [currentService, setCurrentService] = useState({
        label:"",
        diagonal: "",
        count: "1",
        workType: workTypes[0].value,
        message: "",
        price: "",
        mountType: "",
        mountPrice: 0,
        materials:[],
        addons : [],
        addonsPrice: 0,
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isAddingMaterials, setIsAddingMaterials] = useState(false);
    const [isAddingMount, setIsAddingMount] = useState(false);
    const [creatingNewOrChanging,setCreatingNewOrChanging] = useState(false);
    const handleStatusChange = (e) => setStatus(e.target.value);
    const getSheetUrlByTeam = (team) => {
        switch (team) {
            case "A": return 'https://script.google.com/macros/s/AKfycbzZb8N6sHhrYa0J3nbd66RvRIp71HDbgU2eKDjlSHp1eUPHPpITLTkCvuU9nAqToUyN/exec';
            case "B": return 'https://script.google.com/macros/s/AKfycbx2s4Yn5fy6vbDq8ceDl6IKICqCm37GKTLa27K9fqnVnpTgVv8YneGBlMX0gp0C9zvL/exec';
            case "C": return 'https://script.google.com/macros/s/AKfycbzxEa9aTzD_TZWYhdBtJu6_oNQqLvg9zKbMzVRYIiKkwj16w_ri4-BQ-OHQMLFAYqBr_w/exec';
            case "W":return 'https://script.google.com/macros/s/AKfycbwrEH4SU2-Gm3yCXngh8NytxmDcwIcV64ZiCSTu4moUHSfEx5RZvILBofdlN55CMAmnfA/exec';
            default: return 'https://script.google.com/macros/s/AKfycbw7Ro5gCbzIdZDJc4qgvyJivIRO7dejmX6tpal2vP-dCltLfj8eDF0GShhdTTQKnZKZig/exec';
        }
    };

    const handleServiceChange = (e) => {
        setCurrentService({ ...currentService, [e.target.name]: e.target.value });
    };

    const startAdding = () => {
        setCurrentService({
            label:"",
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
            label: "",
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

    const saveMaterial = () => {
        if (!selectedAddMaterials) return;

        const updatedMaterials = [...currentService.materials];

        if (editAddonMaterialIndex !== null) {
            updatedMaterials[editAddonMaterialIndex] = { ...selectedAddMaterials, count: addMaterialsCount };
        } else {
            updatedMaterials.push({ ...selectedAddMaterials, count: addMaterialsCount });
        }

        const updatedPrice = updatedMaterials.reduce((sum, mat) => sum + mat.price * mat.count, 0);

        setCurrentService({
            ...currentService,
            materials: updatedMaterials,
            materialPrice: updatedPrice,
        });

        setSelectedAddMaterials(null);
        setAddMaterialsCount(1);
        setEditAddonMaterialIndex(null);
        setIsAddingMaterials(false);
    };

    const editService = (index) => {
        setCurrentService(services[index]);
        setEditIndex(index);
        setIsAdding(true);
    };
    const [editAddonIndex, setEditAddonIndex] = useState(null);
    const [editAddonMaterialIndex, setEditAddonMaterialIndex] = useState(null);

    const editAddon = (idx) => {
        const add = currentService.addons[idx];
        setSelectedAddon(add);
        setAddonCount(add.count);
        setEditAddonIndex(idx);
        setIsAddingAddons(true);
    };
    const handleCloseMaterialEdit = () => {
        setSelectedAddMaterials(null);
        setAddMaterialsCount(1);
        setEditAddonMaterialIndex(null);
        setIsAddingMaterials(false);
    };
    const editMaterials = (idx) => {
        const addMat = currentService.materials[idx];
        setSelectedAddMaterials(addMat);
        setAddMaterialsCount(addMat.count);
        setEditAddonMaterialIndex(idx);
        setIsAddingMaterials(true);
    };
    const removeMaterial = (idx) => {
        const updated = [...currentService.materials];
        const removed = updated.splice(idx, 1)[0];
        setCurrentService({
            ...currentService,
            materials: updated,
            materialPrice: currentService.materialPrice - removed.price * removed.count,
        });
    };
    const saveMount = () => {
        if (!mountData) return;
        setCurrentService({
            ...currentService,
            mountData: { ...mountData },
        });
        setMountData(null);
        setIsAddingMount(false);
    };
    const saveAddon = () => {
        if (!selectedAddon) return;

        const updatedAddons = [...currentService.addons];

        if (editAddonIndex !== null) {
            updatedAddons[editAddonIndex] = { ...selectedAddon, count: addonCount };
        } else {
            updatedAddons.push({ ...selectedAddon, count: addonCount });
        }

        const updatedPrice = updatedAddons.reduce((sum, addon) => sum + addon.price * addon.count, 0);

        setCurrentService({
            ...currentService,
            addons: updatedAddons,
            addonsPrice: updatedPrice,
        });

        // Сброс
        setSelectedAddon(null);
        setAddonCount(1);
        setEditAddonIndex(null);
        setIsAddingAddons(false);
    };


// Исправленная функция submitToGoogleSheets
    const submitToGoogleSheets = async () => {
        const url = getSheetUrlByTeam(team);
        const manager_id = managerId ? `${managerId}` : "N/A";
        const team_id = team ? team : "N/A";

        const total = customTotal !== null
            ? Number(customTotal)
            : services
                .map(s => ((s.price + s.mountPrice) * s.count + (s.materialPrice || 0) + (s.addonsPrice || 0)))
                .reduce((a, b) => a + b, 0);

        const safeDate = dataLead && !isNaN(Date.parse(dataLead)) ? dataLead : new Date().toISOString();
        const formattedDate = new Date(safeDate).toISOString(); // GMT+0 для MongoDB
        const formattedDateSheets = new Date(safeDate).toISOString().slice(0, 19).replace('T', ' ');

        // ✅ НЕ отправляем leadId - пусть сервер сгенерирует
        const payloadForMongo = {
            owner: `${telegramUsername}`,
            team: team_id,
            manager_id,
            text_status: status,
            leadName,
            address: addressLead,
            phone: phoneNumberLead,
            date: formattedDate,
            city,
            master: selectedMaster,
            comment: commentOrder,
            total,
            services,
            // leadId НЕ отправляем
        };

        console.log("📦 Payload для MongoDB:", JSON.stringify(payloadForMongo, null, 2));

        const result = await submitOrder(payloadForMongo);

        if (!result) {
            alert(`❌ Ошибка при сохранении в базу: ${error}`);
            return;
        }

        // ✅ Используем leadId из ответа сервера
        const finalLeadId = result.leadId;
        console.log("🎯 leadId из сервера:", finalLeadId);

        const payloadForSheets = {
            owner: mongoUser?.name || `${telegramUsername}`,
            team: team_id,
            manager_id,
            text_status: status,
            leadName,
            address: addressLead,
            phone: phoneNumberLead,
            date: formattedDateSheets,
            city,
            master: selectedMaster,
            comment: commentOrder,
            total,
            services,
            leadId: finalLeadId, // ✅ leadId из сервера
        };

        console.log("📦 Payload для Google Sheets:", JSON.stringify(payloadForSheets, null, 2));

        try {
            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadForSheets),
            });

            alert(`✅ Заявка успешно сохранена. Lead ID: ${finalLeadId}`);
        } catch (err) {
            console.error("❌ Ошибка при отправке в Google Sheets:", err);
            alert(`⚠️ Заказ сохранен в базу (ID: ${finalLeadId}), но возникла ошибка при отправке в Google Sheets`);
        }
    };


    const updateOrderInMongoAndSheets = async () => {
        const currentLeadId = leadId; // Используем существующий leadId

        const total = customTotal !== null
            ? Number(customTotal)
            : services
                .map(s => ((s.price + s.mountPrice) * s.count + (s.materialPrice || 0) + (s.addonsPrice || 0)))
                .reduce((a, b) => a + b, 0);

        const safeDate = dataLead && !isNaN(Date.parse(dataLead)) ? dataLead : new Date().toISOString();
        const formattedDate = new Date(safeDate).toISOString(); // GMT+0 для MongoDB

        // ✅ ИСПРАВЛЕНИЕ: Время для Google Sheets тоже в GMT+0
        const formattedDateSheets = new Date(safeDate).toISOString().slice(0, 19).replace('T', ' ');

        const filteredServices = services.map(s => ({
            label:s.label || "",
            diagonal: s.diagonal || "",
            count: String(s.count || "1"),
            workType: s.workType || "",
            message: s.message || "",
            price: Number(s.price || 0),
            mountType: s.mountType || "",
            mountPrice: Number(s.mountPrice || 0),
            materialPrice: Number(s.materialPrice || 0),
            addonsPrice: Number(s.addonsPrice || 0),
            addons: Array.isArray(s.addons)
                ? s.addons.map(a => ({
                    label: a.label || "",
                    value: a.value || "",
                    price: Number(a.price || 0),
                    count: Number(a.count || 0),
                }))
                : [],
            materials: Array.isArray(s.materials)
                ? s.materials.map(m => ({
                    label: m.label || "",
                    value: m.value || "",
                    price: Number(m.price || 0),
                    count: Number(m.count || 0),
                }))
                : [],
        }));

        const payloadUpdate = {
            owner: mongoUser?.name || `@${telegramUsername}`,
            status,
            leadName,
            address: addressLead,
            phone: phoneNumberLead,
            date: formattedDate,
            city,
            master: selectedMaster,
            comment: commentOrder,
            total,
            services: filteredServices,
            leadId: currentLeadId,
        };

        // Получаем текущую заявку
        const existingOrder = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/orderByLeadId/${currentLeadId}`)
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("❌ Ответ сервера:", text);
                    throw new Error(`❌ Заказ с ID ${currentLeadId} не найден (${res.status})`);
                }
                return res.json();
            })
            .catch(err => {
                console.error("🔥 Ошибка загрузки заказа:", err.message);
                alert(err.message);
                return null;
            });

        if (!existingOrder) return;

        const changeEntry = {
            changedAt: new Date().toISOString(), // GMT+0
            changedBy: `@${telegramUsername}`,
            changes: payloadUpdate,
        };

        // Исключаем поля, которые нельзя отправлять
        const { _id, __v, createdAt, updatedAt, original, changes, ...sanitizedExisting } = existingOrder;

        const updatedOrder = {
            ...sanitizedExisting,
            ...payloadUpdate,
            changes: [...(existingOrder.changes || []), changeEntry],
        };

        console.log(updatedOrder);

        try {
            // Обновляем в MongoDB
            const res = await fetch(`https://bot-crm-backend-756832582185.us-central1.run.app/api/orders/${currentLeadId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedOrder),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ Ошибка от сервера:", errorText);
                alert("❌ Ошибка при обновлении заявки. См. консоль.");
                return;
            }

            // Если MongoDB обновился успешно, отправляем в Google Sheets
            const url = getSheetUrlByTeam(team);
            const payloadForSheets = {
                owner: mongoUser?.name || `@${telegramUsername}`,
                team: team || "N/A",
                manager_id: managerId || "N/A",
                text_status: status,
                leadName,
                address: addressLead,
                phone: phoneNumberLead,
                date: formattedDateSheets, // ← GMT+0
                city,
                master: selectedMaster,
                comment: commentOrder,
                total,
                services: filteredServices,
                leadId: currentLeadId, // ← Используем тот же leadId
            };

            try {
                await fetch(url, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payloadForSheets),
                });
            } catch (sheetsError) {
                console.error("❌ Ошибка при обновлении Google Sheets:", sheetsError);
            }

            alert(`✅ Заявка успешно обновлена. Lead ID: ${currentLeadId}`);
        } catch (err) {
            console.error("❌ Ошибка сети или CORS:", err);
            alert("❌ Запрос не дошёл до сервера. Проверь подключение.");
        }
    };


    const allCities = [
        "Austin", "Dallas", "Denver", "Houston", "Las-Vegas", "Los_Angeles",
        "Phoenix", "Portland", "Salt_Lake", "SF", "Sacramento", "San_Diego",
        "Seattle", "New_York", "Florida", "Philadelphia", "Atlanta", "Kansas",
        "Baltimore", "Boston", "Chicago", "Charlotte", "Cary-Raleigh", "Cincinnati",
        "Columbus", "Cleveland", "Detroit", "Indianapolis", "Minneapolis",
        "Milwaukee", "Pittsburgh", "Louisville", "St.Louis", "Richmond",
        "Hartford", "New_Orleans"
    ];
    const [showList, setShowList] = useState(false);
    const filtered = allCities.filter((c) =>
        c.toLowerCase().includes(city.toLowerCase())
    );


    const removeAddon = (idx) => {
        const updated = [...currentService.addons];
        const removed = updated.splice(idx,1)[0];
        setCurrentService({
            ...currentService,
            addons: updated,
            addonsPrice: currentService.addonsPrice - removed.price*removed.count
        });
    };

    const removeService = (index) => {
        setServices(services.filter((_, i) => i !== index));
    };

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
                        border:"0px"
                    }}
                >
                    <IoArrowBack />
                </button>

                <div className="row gap-3">
                    <Header />
                </div>
            </div>

            <h2 className="mb-3 text-center mt-4">Создание новой заявки</h2>



            <div className="mb-3">
                <input className="form-control" placeholder={`Владелец заявки: ${ownerName}`} readOnly />
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
            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Адрес"
                    value={addressLead}
                    onChange={(e) => setAddressLead(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Номер"
                    value={displayValue}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                />
            </div>
            {checkResponse?.orders?.length > 0  && !creatingNewOrChanging && (
                <div className="mt-3 mb-3">
                    <h5>🔁 Найдено {checkResponse.orders.length} дубля:</h5>
                    <ul className="list-group mt-2">
                        {checkResponse.orders.map((order, idx) => (
                            <li
                                key={idx}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    Заказ <strong>{order.order_id}</strong> — {order.text_status || 'без статуса'}
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                        setCreatingNewOrChanging(true);
                                        navigate(`/change/${order.order_id}`);
                                    }}
                                >

                                Открыть
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            <div className="mb-3">
                <div className="d-flex gap-2 mb-3">
                    <input
                        className="form-control"
                        type="date"
                        value={dataLead.split("T")[0]}
                        onChange={(e) => setDataLead(prev => {
                            const time = prev.split("T")[1] || "12:00";
                            return `${e.target.value}T${time}`;
                        })}
                    />
                    <input
                        className="form-control"
                        type="time"
                        step="300"
                        onChange={(e) =>
                            setDataLead((prev) => {
                                const date = prev.split("T")[0] || new Date().toISOString().split("T")[0];
                                const rounded = roundTimeTo5Minutes(e.target.value);
                                return `${date}T${rounded}`;
                            })
                        }
                    />



                </div>

            </div>
            <div className="mb-3">
                <input
                    className="form-control"
                    type="text"
                    placeholder="Город"
                    value={city}
                    onFocus={() => setShowList(true)}
                    onBlur={() => setTimeout(() => setShowList(false), 200)}
                    onChange={(e) => setCity(e.target.value)}
                />
                {showList && (
                    <ul
                        className="list-group mt-1"
                        style={{ maxHeight: 120, overflowY: "auto" }}
                    >
                        {filtered.length > 0 ? (
                            filtered.map((c) => (
                                <li
                                    key={c}
                                    className="list-group-item list-group-item-action"
                                    onMouseDown={() => setCity(c)}
                                >
                                    {c}
                                </li>
                            ))
                        ) : (
                            <li className="list-group-item text-muted">Нет совпадений</li>
                        )}
                    </ul>
                )}
            </div>

            <div className="mb-3">
                <select
                    className="form-select"
                    value={selectedMaster}
                    onChange={(e) => {
                        const name = e.target.value;
                        setSelectedMaster(name);

                        const matched = masters.find((m) => m.name === name);
                        if (matched) {
                            setCity(matched.city);
                        }
                    }}
                >
                    <option value="">Выберите мастера</option>
                    {masters
                        ?.filter((m) => city === "" || m.city.toLowerCase() === city.toLowerCase())
                        .map((m, i) => (
                            <option key={i} value={m.name}>
                                {m.name} ({m.city})
                            </option>
                        ))}
                </select>
            </div>


            <div className="mb-3">
                <input
                    className="form-control"
                    type={"text"}
                    placeholder="Коментарий к заказу"
                    value={commentOrder}
                    onChange={(e) => setCommentOrder(e.target.value)}
                />
            </div>
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
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeService(i)}
                                    >
                                        🗑️
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
                                        .map(s => ((s.price + s.mountPrice ) * s.count + (s.materialPrice||0) + (s.addonsPrice||0)))
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
            {!isAdding && (
                <div>
                    <button className="btn btn-primary" style={{ marginRight: "2vh" }} onClick={startAdding}>
                        Добавить услугу
                    </button>
                    {!updateOrder ? (
                        <button className="btn btn-success" onClick={submitToGoogleSheets}>
                            Отправить заявку в Google Таблицу
                        </button>
                    ) : (
                        <button className="btn btn-success" onClick={updateOrderInMongoAndSheets}>
                            Сохранить изменения в таблицу
                        </button>
                    )}
                </div>


            )}
            {isAdding && (
                <div className="card my-3 p-3 ">
                    <div className=" p-3 position-relative">
                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0"
                            aria-label="Close"
                            onClick={() => setIsAdding(false)}
                        ></button>


                        {/* Здесь остальной контент карточки */}
                    </div>



                    <div className="d-flex flex-column  gap-3 mb-3 align-items-stretch justify-content-center">
                        <button className={"btn btn-info"} onClick={e => setIsAddingMount(true)}>➕ Навес</button>
                        {isAddingMount && (
                            <div className="card p-3 mb-3 d-flex flex-row gap-3 flex-column text-center">
                                <div className=" p-3 position-relative">
                                    <button
                                        type="button"
                                        className="btn-close position-absolute top-0 end-0 "
                                        aria-label="Close"
                                        onClick={() => setIsAddingMount(false)} // закрыть форму добавления
                                    ></button>
                                </div>
                                <div className={"d-flex flex-row gap-3"}>

                                    <input
                                        className="form-control"
                                        name="diagonal"
                                        value={currentService.diagonal}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const num = Number(val);

                                            let autoType = currentService.workType;
                                            let autoPrice = currentService.price;
                                            let label = currentService.label;
                                            if (num <= 31) {
                                                autoType = "tv_std";
                                                label = "TV standard < 31";
                                                autoPrice = 69;
                                                setShowTechChoice(false)
                                            } else if (num >= 32 && num <= 59) {
                                                autoType = "tv_std";
                                                label = "TV standard > 32 <= 59"
                                                autoPrice = 129;
                                                setShowTechChoice(false)
                                            } else if (num >= 60) {

                                                setShowTechChoice(true);
                                            }

                                            setCurrentService({
                                                ...currentService,
                                                diagonal: val,
                                                workType: autoType,
                                                label: label,
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
                                                    label: "ТМ > 60 1tech",
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
                                                    label: "ТМ > 60 2tech",
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
                                <div className="card d-flex flex-column justify-content-center align-items-center">
                                    <p className="mb-0 me-2 text-black" style={{ fontSize: "2vh" }}>Маунт наш?</p>
                                    <div className="m-2">
                                        <button
                                            className={`btn ${!isWeOwnerMount ? 'btn-success' : 'btn-outline-success'} ` } style={{marginRight:"1vh"}}
                                            onClick={() => setIsWeOwnerMount(false)}
                                        >
                                            Да
                                        </button>
                                        <button
                                            className={`btn ${isWeOwnerMount ? 'btn-danger' : 'btn-outline-danger'}`}
                                            style={{ marginLeft: "1vh" }}
                                            onClick={() => {
                                                setIsWeOwnerMount(true);
                                                setCurrentService({
                                                    ...currentService,
                                                    mountType: '',
                                                    mountPrice: 0
                                                });
                                            }}
                                        >
                                            Нет
                                        </button>

                                    </div>
                                </div>
                                {!isWeOwnerMount && (
                                    <div>

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
                                )}

                                {/*<button*/}
                                {/*    className="btn btn-sm btn-outline-success"*/}
                                {/*    onClick={() => {*/}
                                {/*        saveMount();*/}
                                {/*        setIsAddingMount(false);*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    💾 Сохранить навес*/}
                                {/*</button>*/}

                            </div>


                            )}
                        {currentService.mountData?.length > 0 && (
                            <div className="mb-3">
                                <h6>🛠️ Дополнительные услуги:</h6>
                                <ul className="list-group">
                                    {currentService.addons.map((mat, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{mat.label} × {mat.count}</span>
                                            <span>{mat.price * mat.count} $</span>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => editAddon(idx)}    // ← тут
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeAddon(idx)}  // ← и тут
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className={"btn btn-warning"} onClick={e => setIsAddingAddons(true)}>➕ Услуги</button>
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
                                <div className={"d-flex flex-row flex-md-row gap-3 mb-3 align-items-stretch justify-content-center"}>
                                    <select
                                        className="form-select"
                                        value={selectedAddon?.value || ''}

                                        onChange={(e) => {
                                            const addon = additionalServices.find(m => m.value === e.target.value);
                                            setSelectedAddon(addon || null);
                                        }}
                                    >
                                        <option value="">Выберите услугу</option>
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
                                    onClick={saveAddon}
                                >
                                    💾 Сохранить
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
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => editAddon(idx)}    // ← тут
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeAddon(idx)}  // ← и тут
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button className={"btn btn-primary"} onClick={e => setIsAddingMaterials(true)}>➕ Материалы</button>
                        {isAddingMaterials && (
                            <div className="card p-3 text-center mb-3">
                                <div className="p-3 position-relative">
                                    <button
                                        type="button"
                                        className="btn-close position-absolute top-0 end-0"
                                        aria-label="Close"
                                        onClick={handleCloseMaterialEdit}
                                    ></button>
                                </div>
                                <h5>{editAddonMaterialIndex !== null ? "Редактировать материал" : "Добавить материал"}</h5>
                                <div className={"d-flex flex-row flex-md-row gap-3 mb-3 align-items-stretch justify-content-center"}>
                                    <select
                                        className="form-select"
                                        value={selectedAddMaterials?.value || ''}
                                        onChange={(e) => {
                                            const mat = materialsList.find(m => m.value === e.target.value);
                                            setSelectedAddMaterials(mat);
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
                                        value={addMaterialsCount}
                                        min={1}
                                        onChange={(e) => setAddMaterialsCount(Number(e.target.value))}
                                        style={{ width: "20%", textAlign: "center" }}
                                    />
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={saveMaterial}
                                >
                                    💾 Сохранить
                                </button>
                            </div>
                        )}
                        {currentService.materials.length > 0 && (
                            <div className="mb-3">
                                <h6>📦 Материалы:</h6>
                                <ul className="list-group">
                                    {currentService.materials.map((mat, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                            <span>{mat.label} × {mat.count}</span>
                                            <span>{mat.price * mat.count} $</span>
                                            <div className="btn-group">
                                                <button onClick={() => editMaterials(idx)} className="btn btn-sm btn-outline-secondary">✏️</button>
                                                <button onClick={() => removeMaterial(idx)} className="btn btn-sm btn-outline-danger">🗑️</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}







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


        </div>
    );
};

export default Form;
