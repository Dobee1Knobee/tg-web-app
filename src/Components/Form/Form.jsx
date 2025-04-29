import "./Form.css"
import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";



const Form = () => {
    const {user} = useTelegram();
    const [status,setStatus] = React.useState();
    const owner = user?.username;
    const onChageStatus = (e) => {
        setStatus(e.target.value);
    }
    return (
        <div className={"form"} >
            <h1>Создание новой заявки by {owner}</h1>
            <input type="text" placeholder={"Номер лида"}/>
            <select value={status} onChange={onChageStatus} className={"select"}>
                <option value={"В работе"}>В работе</option>
                <option value={"Другой регион"}>Другой регион</option>
                <option value={"Невалидный"}>Невалидный</option>
                <option value={"Недозвон"}>Недозвон</option>
                <option value={"Ночной"}>Ночной</option>
                <option value={"Ночной ранний"}>Ночной ранний</option>
                <option value={"Нужно подтверждение"}>Нужно подтверждение</option>
                <option value={"Нужно согласование"}>Нужно согласование</option>
                <option value={"Оформлен"}>Оформлен</option>
                <option value={"Прозвонить завтра"}>Прозвонить завтра</option>
                <option value={"Статус заказа"}>Статус заказа</option>
            </select>
                <h2>Какая диагональ телевизора</h2>
                <select>
                    <option value={"30"}>30</option>
                    <option value={"40"}>40</option>
                    <option value={"50"}>50</option>
                    <option value={"60"}>60</option>
                    <option value={"70"}>70</option>
                    <option value={"80"}>80</option>
                </select>
                <h2>Количество</h2>
                <input type={"number"}></input>
        </div>
    );
};

export default Form;