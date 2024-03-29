/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        dbConfig: {
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
        },
    },
}

module.exports = nextConfig
