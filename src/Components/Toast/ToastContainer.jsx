import React, { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import Toast from './Toast';
import ScheduleToast from './ScheduleToast';

export const ToastContainer = () => {
    const { toasts, scheduleToasts, removeToast, removeScheduleToast } = useContext(ToastContext);

    return (
        <>
            {/* Обычные тосты */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9998
            }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={removeToast}
                    />
                ))}
            </div>

            {/* Schedule тосты */}
            {scheduleToasts.map(toast => (
                <ScheduleToast
                    key={toast.id}
                    id={toast.id}
                    data={toast.data}
                    duration={toast.duration}
                    onClose={removeScheduleToast}
                />
            ))}
        </>
    );
};
