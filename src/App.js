import './App.css';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Form from "./Components/Form/Form";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, Routes } from "react-router-dom";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import OrderChange from "./Components/SearchAndChange/OrderChange";
import OwnOrders from "./Components/OwnOrders /OwnOrders";
import BuferedOrders from "./Components/BuferedOrders/BuferedOrders";
import PinCodePage from "./Components/PinCodePage/PinCodePage";

function App() {
    const { tg } = useTelegram();

    useEffect(() => {
        tg.ready();
    }, []);

    return (
        <div className="App">
            <Routes>
                <Route index element={<PinCodePage />} />

                <Route  path="/welcomePage" element={<WelcomePage />} />
                <Route path="/form" element={<Form />} />
                <Route path="/ownOrders" element={<OwnOrders />} />
                <Route path="/buferedOrders" element={<BuferedOrders />} />

                <Route path="/change/:leadId" element={<Form />} />
            </Routes>
        </div>
    );
}

export default App;
