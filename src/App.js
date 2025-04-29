import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./Components/Header/Header";
import Form from "./Components/Form/Form";
import {Route, Routes} from "react-router-dom";
function App() {
    const {tg} = useTelegram();

  useEffect(() => {
    tg.ready()
  })

   return (
      <div className="App">
        <Header />
        <Routes>
            <Route index element={<Form/>}></Route>
        </Routes>
      </div>
    );
  }

export default App;
