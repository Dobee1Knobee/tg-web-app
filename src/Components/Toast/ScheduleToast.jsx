import { useEffect, useState } from "react";

export default function ScheduleToast({ id, data, duration = 8000, onClose }) {
    const [visible, setVisible] = useState(true);
    const [copied, setCopied] = useState(false);

    // Функция для конвертации времени в формат AM/PM
    const formatTimeToAMPM = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';

        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesFormatted} ${ampm}`;
    };

    // Функция для форматирования services
    const formatServices = (servicesArray) => {
        if (!servicesArray || servicesArray.length === 0) return "No services";

        return servicesArray.map(service => {
            let serviceString = `${service.label} (${service.count}x)`;
            if (service.diagonal) serviceString += ` - ${service.diagonal}"`;
            if (service.mountType) serviceString += ` - ${service.mountType}`;

            if (service.materials && service.materials.length > 0) {
                const materials = service.materials.map(mat => `${mat.label} (${mat.count}x)`).join(', ');
                serviceString += ` + Materials: ${materials}`;
            }

            if (service.addons && service.addons.length > 0) {
                const addons = service.addons.map(addon => `${addon.label} (${addon.count}x)`).join(', ');
                serviceString += ` + Addons: ${addons}`;
            }

            return serviceString;
        }).join(' | ');
    };

    // Создаем строку для копирования
    const scheduleString = `${formatTimeToAMPM(data.date)} ${data.order_id} ${data.text_status || 'N/A'} ${data.leadName || 'N/A'} ${formatServices(data.services)} Address: ${data.address || 'N/A'} ZIP: ${data.zip_code || 'N/A'} phone: ${data.phone ? data.phone.slice(-4) : 'N/A'} Total: ${data.total || 0}$`;

    // Функция копирования
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(scheduleString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    useEffect(() => {
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
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: "#4CAF50",
            color: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
            width: "380px",
            fontFamily: "sans-serif",
            fontSize: "14px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(100%)",
            transition: "all 0.3s ease",
            zIndex: 9999
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>Application Saved!</span>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(() => onClose(id), 300);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        opacity: 0.7,
                        lineHeight: 1
                    }}
                >
                    ×
                </button>
            </div>

            {/* Main Info */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '6px'
                }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '13px'
                    }}>
                        {formatTimeToAMPM(data.date)}
                    </span>
                    <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                    }}>
                        {data.order_id}
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '13px',
                    opacity: 0.95
                }}>
                    <div>👤 {data.leadName }</div>
                    <div>📱 ***-{data.phone ? data.phone.slice(-4) : 'N/A'}</div>
                    <div>💰 ${data.total || 0}</div>
                    <div>📍 {data.zip_code || 'N/A'}</div>
                </div>

                <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    opacity: 0.9,
                    background: 'rgba(255,255,255,0.1)',
                    padding: '6px',
                    borderRadius: '6px',
                    maxHeight: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    🔧 {data.services ? data.services.length : 0} service{(data.services && data.services.length !== 1) ? 's' : ''}: {formatServices(data.services)}
                </div>
            </div>

            {/* Copy Button */}
            <button
                onClick={copyToClipboard}
                style={{
                    width: '100%',
                    background: copied ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                    color: copied ? '#4CAF50' : 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
                onMouseEnter={(e) => {
                    if (!copied) {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!copied) {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                    }
                }}
            >
                <span style={{ fontSize: '14px' }}>
                    {copied ? '✅' : '📋'}
                </span>
                {copied ? 'Copied!' : 'Copy Schedule String'}
            </button>
        </div>
    );
}