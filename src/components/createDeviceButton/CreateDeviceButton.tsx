'use client';

import { useState } from 'react';
import { Device } from '@/lib/types';
import styles from './CreateDeviceButton.module.scss';
import { usePathname } from 'next/navigation';
import { Modal } from '../modal/Modal';

export function CreateDeviceButton({
    addNewDevice
} : {
    addNewDevice: (newDevice: Device) => void
}) {

    const pathname = usePathname();

    const [show, showModal] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [valueType, setValueType] = useState<'number'|'string'>('number');
    const [unit, setUnit] = useState<string>('');

    return (
        <>
            <div
                className={styles.cell}
                onClick={() => {showModal(true)}}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="48" width="48">
                    <path xmlns="http://www.w3.org/2000/svg" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
            <Modal
                show={show}
                close={() => {showModal(false)}}
                title="New Device"
                actionTexts={["Confirm"]}
                actionCallbacks={[
                    () => {
                        if (name == '') {
                            window.alert('Name cannot be empty!');
                            return;
                        }

                        fetch(pathname + 'api', {
                            method: 'POST',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ name, valueType, unit })
                        })
                            .then((response) => response.json())
                            .then((device) => {
                                console.log(device);
                                addNewDevice(device);

                                setName('');
                                setValueType('number');
                                setUnit('');
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
