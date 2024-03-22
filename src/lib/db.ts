import getConfig from 'next/config';
import { DataTypes, Model, QueryTypes, Sequelize } from 'sequelize';

const { serverRuntimeConfig } = getConfig();
const { dbConfig } = serverRuntimeConfig;

if (dbConfig === undefined || dbConfig.host === undefined || dbConfig.port === undefined || dbConfig.user === undefined || dbConfig.password === undefined || dbConfig.database === undefined) {
    throw new Error("Error while checking db config");
} 
dbConfig.port = parseInt(dbConfig.port);

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, { 
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mariadb',
    dialectModule: require('mariadb'), 
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
    }
});

export const Device = sequelize.define('Device', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    valueType: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
},{
    tableName: 'devices',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});

export const Record = sequelize.define('Record', {
    entry: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    did: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: true },
    created: { type: DataTypes.DATE, allowNull: false },
}, {
    tableName: 'records',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});

Device.hasMany(Record, { foreignKey: 'did', as: 'records' });
Record.belongsTo(Device, { foreignKey: 'did' });

(async () => {
    await sequelize.authenticate();
    console.log("Successful authentication");
    await sequelize.sync();
    console.log("Successful synchronization");
})();

export async function checkDevice(did: number) {
    try {
        return await Device.findOne({ where: { id: did } });
    } catch (error) {
        return null;
    }
}

export async function createDevice(name: string, valueType: string, unit: string | null) {

    try {
        const newDevice = await Device.create({ name, valueType, unit });
        console.log(newDevice.toJSON())
        return newDevice;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateDevice(did: number, name: string, valueType: string, unit: string | null) {

    try {
        const device = await Device.findOne({ where: { id: did } });
        if (!device) {
            return null;
        }

        device.set({
            name,
            valueType,
            unit,
        });
        const updatedDevice = await device.save();
        console.log(updatedDevice.toJSON())
        return updatedDevice;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createRecord(did: number, value: string) {

    try {
        const newRecord = await Record.create({ did, value, created: new Date().toISOString() });
        console.log(newRecord.toJSON());
        return newRecord;
    
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getDeviceAndAllRecords(did: number) {

    try {
        const device = await Device.findOne({
            where: {
                id: did,
            },
            include: [{
                model: Record,
                order: [['created', 'DESC']],
                as: 'records',
            }],
        });
        return device;
        
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getDeviceAndFilteredRecords(did: number, startDate: Date, endDate: Date) {
    
    try {

        // Prepared query for the project requirement
        const filteredRecords = await sequelize.query(
            "SELECT * FROM records WHERE did = :did AND created >= :startDate AND created <= :endDate",
            {
                model: Record,
                mapToModel: true,
                replacements: {
                    did,
                    startDate: `${startDate.toISOString().substring(0,10)} 00:00:00`,
                    endDate: `${endDate.toISOString().substring(0,10)} 23:59:59`,
                },
                type: QueryTypes.SELECT,
            }
        ); 

        return filteredRecords;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getDeviceStatistics(did: number, type: string, startDate?: Date, endDate?: Date) {
    
    try {

        // For statistics for number device, return MAX, MIN, AVG
        if (type == "number") {

            if (startDate && endDate) {
                return await sequelize.query(
                    "SELECT MAX(value) AS max, MIN(value) AS min, AVG(value) AS avg FROM records WHERE did = :did AND created >= :startDate AND created <= endDate",
                    {
                        replacements: {
                            did,
                            startDate: `${startDate.toISOString().substring(0,10)} 00:00:00`,
                            endDate: `${endDate.toISOString().substring(0,10)} 23:59:59`,
                        },
                        type: QueryTypes.SELECT,
                    }
                )
            }

            return await sequelize.query(
                "SELECT MAX(value) AS max, MIN(value) AS min, AVG(value) AS avg FROM records WHERE did = :did",
                {
                    replacements: { did },
                    type: QueryTypes.SELECT,
                }
            )

        } else if (type == "string") {
            // For statistics for string device, return COUNT for each value and order by the count
            if (startDate && endDate) {
                return await sequelize.query(
                    "SELECT value, COUNT(*) AS cnt FROM records WHERE did = :did AND created >= :startDate AND created <= endDate GROUP BY value ORDER BY cnt DESC",
                    {
                        replacements: {
                            did,
                            startDate: `${startDate.toISOString().substring(0,10)} 00:00:00`,
                            endDate: `${endDate.toISOString().substring(0,10)} 23:59:59`,
                        },
                        type: QueryTypes.SELECT,
                    }
                )
            }

            return await sequelize.query(
                "SELECT value, COUNT(*) AS cnt FROM records WHERE did = :did GROUP BY value ORDER BY cnt DESC",
                {
                    replacements: { did },
                    type: QueryTypes.SELECT,
                }
            )
        }

        return null;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getAllDevicesAndMostRecentRecord() {

    try {
        const devices = await Device.findAll({
            include: [{
                model: Record,
                order: [['created', 'DESC']],
                limit: 1,
                as: 'records',
            }],
        });
        return devices;
        
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteDeviceAndRecords(did: number) {

    try {
        await Device.destroy({
            where: {
                id: did,
            }
        });
        return 0;
        
    } catch (error) {
        console.error(error);
        return null;
    }
}
