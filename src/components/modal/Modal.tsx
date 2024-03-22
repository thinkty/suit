'use client';

import styles from './Modal.module.scss';

export function Modal({
    show,
    close,
    title,
    actionTexts,
    actionCallbacks,
    hideDefaultCancel,
    children,
} : {
    show: boolean,
    close: () => void,
    title: string,
    actionTexts?: string[],
    actionCallbacks?: VoidFunction[],
    hideDefaultCancel?: boolean,
    children: string | JSX.Element | JSX.Element[],
}) {
    return (
        show &&
        <div
            className={styles.background}
            onClick={(e) => {
                e.stopPropagation();
                close();
            }}
        >
            <div
                className={styles.modal}
                onClick={(e) => {e.stopPropagation()}}
            >
                <div
                    className={styles.close}
                    onClick={close}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path xmlns="http://www.w3.org/2000/svg" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="var(--foreground-secondary)"></path>
                    </svg>
                </div>
                <div className={styles.head}>
                    {title}
                </div>

                {children}

                <div className={styles.action}>
                    {
                        !hideDefaultCancel &&
                        <div
                            className={styles.button}
                            onClick={close}
                        >
                            Cancel
                        </div>
                    }
                    {
                        actionTexts &&
                        actionCallbacks && 
                        actionTexts.map((text, i) => (
                            <div
                                key={text}
                                className={styles.button}
                                onClick={actionCallbacks[i]}
                            >
                                {text}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
