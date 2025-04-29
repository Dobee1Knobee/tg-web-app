import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./Components/Header/Header";


function App() {
    const {tg,onToggleButton} = useTelegram();

  useEffect(() => {
    tg.ready()
  })

   return (
      <div className="App">
        <Header />
        <button onClick={onToggleButton}>
          Toggle Telegram
        </button>
      </div>
    );
  }

export default App;
