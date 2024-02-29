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
});

export const Device = sequelize.define('Device', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    valueType: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: true },
},{
    tableName: 'devices',
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
});

(async () => {
    await sequelize.authenticate();
    console.log("Successful authentication");
    await sequelize.sync();
    console.log("Successful synchronization");
})();

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

export async function getAllDevices(): Promise<null|number> {

    try {

        
        // TODO:
        return 7

    } catch (error) {
        console.error(error)
        return null
    }
}