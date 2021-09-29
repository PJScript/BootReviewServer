import 'dotenv/config';
export default () => ({
  database: {
    TOKENT_SECRET: process.env.TOKEN_SECRET || '',
    TOKEN_SALT: process.env.TOKEN_SALT || '', 
    PATH_REFRESH_TOKEN: process.env.PATH_REFRESH_TOKEN || '',
    DB_HOST: process.env.DB_HOST || '',
    DB_USERNAME: process.env.DB_USERNAME  || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_DATABASE_NAME: process.env.DB_DATABASE_NAME || ''
  }
})