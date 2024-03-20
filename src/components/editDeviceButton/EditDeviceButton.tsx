'use client';

import { useState } from 'react';
import { Device } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { Modal } from '../modal/Modal';
import styles from './EditDeviceButton.module.scss';

export function EditDeviceButton({
    device,
    remove,
    updateDevice,
} : {
    device: Device,
    remove: () => void,
    updateDevice: (updatedDevice: Device) => void,
}) {

    const pathname = usePathname();

    const [show, showModal] = useState<boolean>(false);
    const [name, setName] = useState<string>(device.name);
    const [valueType, setValueType] = useState<string>(device.valueType);
    const [unit, setUnit] = useState<string>(device.unit);

    return (
        <>
            <div
                className={styles.settings}
                onClick={() => {showModal(true)}}
            >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="24,0 0,0 24,24" fill="var(--foreground-secondary)"/>
                </svg>
            </div>
            <Modal
                show={show}
                close={() => {showModal(false)}}
                title="Update Device"
                actionTexts={["Delete", "Confirm"]}
                actionCallbacks={[
                    () => {
                        if (window.confirm(`Remove ${device.name} device?`)) {

                            // Delete the device and all its records from database
                            fetch(pathname + 'api', {
                                method: 'DELETE',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify({ deviceId: device.id })
                            })
                                .then((response) => {
                                    if (response.status != 200) {
                                        alert('Failed to remove device');
                                        return;
                                    }
                                    remove(); // Remove it from the UI
                                })
                                .catch((error) => {
                                    alert('Could not remove device');
                                    console.error(error);
                                });
                        }
                    },
                    () => {
                        if (name == '') {
                            window.alert('Name cannot be empty!');
                            return;
                        }

                        fetch(pathname + 'api', {
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ id: device.id, name, valueType, unit })
                        })
                            .then((response) => response.json())
                            .then((updatedDevice) => {
                                console.log(updatedDevice);
                                updateDevice(updatedDevice);
                                showModal(false);
                            })
                            .catch((error) => {
                                alert('Could not add new device');
                                console.error(error);
                            });
                    }
                ]}
            >
                <div className={styles.form}>
                    <label>
                        Name
                        <input
                            className={styles.textInput}
                            value={name}
                            onChange={(e) => {setName(e.target.value)}}
                        />
                    </label>
                    <label>
                        Value Type
                        <input
                            type="radio"
                            value="number"
                            checked={valueType == "number"}
                            onChange={(e) => {setValueType("number")}}
                        />
                        number
                        <input
                            type="radio"
                            value="string"
                            checked={valueType == "string"}
                            onChange={(e) => {setValueType("string")}}
                        />
                        string
                    </label>
                    <label>
                        Value Unit
                        <input
                            className={styles.textInput}
                            value={unit}
                            onChange={(e) => {setUnit(e.target.value)}}
                        />
                    </label>
                </div>
            </Modal>
        </>
    )
}
