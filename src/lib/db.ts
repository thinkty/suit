import getConfig from 'next/config';
import { DataTypes, Model, Sequelize } from 'sequelize';

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
}, {
    tableName: 'records',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});

Device.hasMany(Record, { foreignKey: 'did', as: 'records' });
Record.belongsTo(Device);

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

export async function createRecord(did: number, value: string) {

    try {
        const newRecord = await Record.create({ did, value });
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
                order: [['createdAt', 'DESC']],
                as: 'records',
            }],
        });
        return device;
        
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
                order: [['createdAt', 'DESC']],
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