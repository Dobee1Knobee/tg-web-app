import { createContext } from "react";
import { useToast } from "../hooks/Toast/useToast";

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const toast = useToast();
    return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>;
};
