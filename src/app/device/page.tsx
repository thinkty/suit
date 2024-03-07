'use client';

import { useSearchParams } from 'next/navigation';
import { BackButton } from '@/components/backButton/BackButton';
import { Graph } from '@/components/graph/Graph';
import styles from './page.module.scss';

export default function DevicePage() {
    const searchParams = useSearchParams();
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
        return (
            <div className={styles.main}>
                <div className={styles.head}>
                    <div className={styles.title}>SUIT</div>
                    <div className={styles.description}>Simple Unsecure IoT Platform</div>
                </div>

                <div>Error: No device ID</div>

                <BackButton />
            </div>
        );
    }

    return (
        <div className={styles.main}>
            <div className={styles.head}>
                <div className={styles.title}>SUIT</div>
                <div className={styles.description}>Simple Unsecure IoT Platform</div>
            </div>

            <Graph deviceId={deviceId} />

            <BackButton />
        </div>
    );
}
