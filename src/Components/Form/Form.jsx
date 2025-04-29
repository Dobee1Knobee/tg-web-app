import "./Form.css"
import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";



const Form = () => {
    const {user} = useTelegram();
    const owner = user?.username;
    const [status,setStatus] = React.useState();
    const onChageStatus = (e) => {
        setStatus(e.target.value);
    }
    return (
        <div className={"form"}  style={{marginTop:"2vh"}}>
            <h2>Создание новой заявки</h2>
            <input className={"input"} type="text" placeholder={"Номер лида"} />
            <input className={"input"} placeholder={`Владелец заявки: ${owner}`} readOnly={true} />
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start",marginTop:"1vh",gap:"1.3vh" }}>
               <h4>Статус заявки</h4>
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
                {/*<h2>Какая диагональ телевизора</h2>*/}
                {/*<select>*/}
                {/*    <option value={"30"}>30</option>*/}
                {/*    <option value={"40"}>40</option>*/}
                {/*    <option value={"50"}>50</option>*/}
                {/*    <option value={"60"}>60</option>*/}
                {/*    <option value={"70"}>70</option>*/}
                {/*    <option value={"80"}>80</option>*/}
                {/*</select>*/}
                {/*<h2>Количество</h2>*/}
                {/*<input type={"number"}></input>*/}
        </div>
    );
};

export default Form;