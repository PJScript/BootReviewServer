'use strict';

module.exports = {
  apps: [
    {
      name: "BootView", // pm2로 실행한 프로세스 목록에서 이 애플리케이션의 이름으로 지정될 문자열
      script: "./dist/main.js", // pm2로 실행될 파일 경로
      watch: true, // 파일이 변경되면 자동으로 재실행 (true || false)
      env: {
        "NODE_ENV": "development", // 개발환경시 적용될 설정 지정
        "TOKEN_SECRET" : "CQ7ERGKXJ",
"TOKEN_SALT": "ROCKET",

"PATH_REFRESH_TOKEN" : "REFRESH_HELLO123@",

"DB_HOST" : "bootreview.cq7ergkxjze4.ap-northeast-2.rds.amazonaws.com",
"DB_USERNAME" : "admin",
"DB_PASSWORD" : "admin1346",
"DB_PORT" : 3306,
"DB_DATABASE_NAME" : "BootReview"
      },
      env_production: {
        "NODE_ENV": "production" // 배포환경시 적용될 설정 지정
      }
    }
  ]
};
