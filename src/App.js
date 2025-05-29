import './App.css';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Form from "./Components/Form/Form";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, Routes } from "react-router-dom";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import OrderChange from "./Components/SearchAndChange/OrderChange";

function App() {
    const { tg } = useTelegram();

    useEffect(() => {
        tg.ready();
    }, []);

    return (
        <div className="App">
            <Routes>
                <Route index element={<WelcomePage />} />
                <Route path="/form" element={<Form />} />
                <Route path="/change/:leadId" element={<Form />} />
            </Routes>
        </div>
    );
}

export default App;
