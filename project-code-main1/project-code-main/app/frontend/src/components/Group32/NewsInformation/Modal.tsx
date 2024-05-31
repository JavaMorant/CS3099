import React from 'react';
import './Modal.css';

interface ModalProps {
    showModal: boolean;
    handleClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ showModal, handleClose, children }) => {
    if (!showModal) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>Close</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
