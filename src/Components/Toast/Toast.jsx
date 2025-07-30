import { useEffect, useState } from "react";

export default function Toast({ id, message, type = "success", duration = 5000, onClose }) {
    const [visible, setVisible] = useState(true);

    const colors = {
        success: { bg: "#4CAF50", bar: "#81C784" },
        error: { bg: "#F44336", bar: "#E57373" },
        info: { bg: "#f1c022", bar: "#f3c221" }};

    useEffect(() => {
        // ❌ Удаляем тост по окончании времени
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [id, duration, onClose]);

    return (
        <div style={{
            background: colors[type].bg,
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            marginBottom: "12px",
            width: "300px",
            fontFamily: "sans-serif",
            fontSize: "16px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.3s ease"
        }}>
            <div>{message}</div>

        </div>
    );
}
