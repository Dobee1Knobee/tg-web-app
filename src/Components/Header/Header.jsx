import React from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import "./Header.css"
import logo from "../../logo/yellowpng.png"
const Header = () => {
    const {user} = useTelegram();


    return (
        <div className={'header'}>
            <img width={"100px"} src={logo} alt={"logo"} style={{marginTop:"6vh",textAlign:"center"}} />
            <span className={"username"}>
                {user?.username}
            </span>
        </div>
    );
};

export default Header;