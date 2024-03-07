
import { Dashboard } from '@/components/dashboard/Dashboard'
import styles from './page.module.scss'

export default function HomePage() {
    return (
        <div className={styles.main}>
            <div className={styles.head}>
                <div className={styles.title}>SUIT</div>
                <div className={styles.description}>Simple Unsecure IoT Platform</div>
            </div>

            <Dashboard />
        </div>
    )
}
