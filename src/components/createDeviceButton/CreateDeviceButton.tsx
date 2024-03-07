'use client';

import { useState } from 'react';
import { Device } from '@/lib/types';
import styles from './CreateDeviceButton.module.scss';
import { usePathname } from 'next/navigation';

export function CreateDeviceButton({
    addNewDevice
} : {
    addNewDevice: (newDevice: Device) => void
}) {

    const pathname = usePathname();

    const [modal, setModal] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [valueType, setValueType] = useState<'number'|'string'>('number');
    const [unit, setUnit] = useState<string>('');

    return (
        <>
            <div
                className={styles.cell}
                onClick={() => {setModal(!modal)}}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="48" width="48">
                    <path xmlns="http://www.w3.org/2000/svg" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
            {
                modal &&
                <div
                    className={styles.createModal}
                    onClick={(e) => {
                        e.stopPropagation()
                        setModal(false)
                    }}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => {e.stopPropagation()}}
                    >
                        <div
                            className={styles.close}
                            onClick={(e) => {
                                e.stopPropagation()
                                setModal(false)
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path xmlns="http://www.w3.org/2000/svg" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="var(--foreground-secondary)"></path>
                            </svg>
                        </div>
                        <div className={styles.head}>
                            New Device
                        </div>
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
                        <div className={styles.action}>
                            <div
                                className={styles.button}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setModal(false)
                                }}
                            >
                                Cancel
                            </div>
                            <div
                                className={styles.button}
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (name == '') {
                                        window.alert('Name cannot be empty!');
                                        return
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
                                            setModal(false);
                                        })
                                        .catch((error) => {
                                            alert('Could not add new device');
                                            console.error(error);
                                        });
                                }}
                            >
                                Confirm
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
