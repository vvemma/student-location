# 수업 유연화 학생 관리 시스템

학생의 반, 번호, 이름, 교시별 위치를 관리하는 실시간 웹 애플리케이션.

## 기능

- 학생 추가 / 수정
- 반별, 위치별 정렬
- 실시간 동기화 (Socket.IO)
- 엑셀(CSV) 내보내기

## 기술 스택

- **서버**: Node.js, Express, Socket.IO
- **DB**: MongoDB (Mongoose)
- **프론트**: HTML, CSS, JavaScript

## 실행 방법

```bash
npm install
cp .env.example .env   # .env 파일을 만들고 MongoDB URI 입력
npm start              # http://localhost:3000
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `MONGO_URI` | MongoDB 연결 문자열 |
| `PORT` | 서버 포트 (기본 3000) |
