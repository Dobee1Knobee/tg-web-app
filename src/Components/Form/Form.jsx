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
        <div className={"form"}>
            <h1>Создание новой заявки</h1>
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
        </div>
    );
};

export default Form;