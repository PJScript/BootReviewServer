'use strict';
import 'dotenv/config';

module.exports = {
  
  apps: [
    {
      name: "BootView", // pm2로 실행한 프로세스 목록에서 이 애플리케이션의 이름으로 지정될 문자열
      script: "./dist/main.js", // pm2로 실행될 파일 경로
      watch: true, // 파일이 변경되면 자동으로 재실행 (true || false)
      env: {
        "NODE_ENV": "development", // 개발환경시 적용될 설정 지정
        "TOKEN_SECRET": process.env.TOKEN_SECRET,
        "TOKEN_SALT": process.env.TOKEN_SALT,
        "PATH_REFRESH_TOKEN": process.env.PATH_REFRESH_TOKEN,
        "DB_HOST": process.env.DB_HOST,
        "DB_USERNAME": process.env.DB_USERNAME ,
        "DB_PASSWORD": process.env.DB_PASSWORD,
        "DB_PORT": process.env.DB_PORT,
        "DB_DATABASE_NAME": process.env.DB_DATABASE_NAME
      },
      env_production: {
        "NODE_ENV": "production" // 배포환경시 적용될 설정 지정
      }
    }
  ]
};
