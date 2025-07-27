import Toast from "./Toast";

const ToastContainer = ({toasts,onRemoveToast}) => {
    console.log("📦 ToastContainer получил тосты:", toasts);

    return (
        <div
            className={"toast-container1"}
            style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 999999,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: "400px",
                width: "auto",
                maxHeight: "80vh",
                overflow: "visible",
                pointerEvents: "auto"
            }}
        >


            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                id={toast.id}
                type={toast.type}
                onClose={onRemoveToast}
                message={toast.message}
                duration={toast.duration}
                >

                </Toast>
            ))}
        </div>
    )
}
export default ToastContainer;
