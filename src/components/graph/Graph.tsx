
import { Loader } from '../loader/Loader'
import styles from './Graph.module.scss'

export function Graph({
    deviceId
} : {
    deviceId: string
}) {

    // TODO: fetch data from server

    return (
        <div className={styles.graph}>
            <p>{deviceId}</p>
            <Loader />
        </div>
    )
}
