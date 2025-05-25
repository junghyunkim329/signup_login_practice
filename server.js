// server.js - Express 백엔드 서버
const mysql = require('mysql2');
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

// 세션 설정: 로그인 상태 유지 (브라우저 종료 또는 만료 시 해제)
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 } // 30분 유지
}));

// JSON, URL 인코딩된 요청 본문 파싱 + 정적 파일 제공
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'front')));

// MySQL 연결
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kimjunghyun'
});

// 루트: 로그인 상태 확인 후 홈 또는 로그인 페이지로
app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'front', 'home.html'));
});

// 회원가입
app.post('/signup', async (req, res) => {
  const { id, pw, name } = req.body;
  if (!id || !pw || !name) return res.status(400).send('모든 필드를 입력하세요.');
  try {
    const hash = await bcrypt.hash(pw, 10);
    const sql = 'INSERT INTO user (UserID, UserPW, UserName) VALUES (?, ?, ?)';
    connection.query(sql, [id, hash, name], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).send('이미 존재하는 아이디입니다.');
        return res.status(500).send('DB 오류');
      }
      res.send('회원가입 성공!');
    });
  } catch (e) {
    res.status(500).send('서버 오류');
  }
});

// 로그인
app.post('/login', (req, res) => {
  const { id, pw } = req.body;
  if (!id || !pw) return res.status(400).send('아이디와 비밀번호를 입력하세요.');

  const sql = 'SELECT * FROM user WHERE UserID = ?';
  connection.query(sql, [id], async (err, results) => {
    if (err) return res.status(500).send('DB 오류');
    if (results.length === 0) return res.status(401).send('존재하지 않는 아이디입니다.');

    const user = results[0];
    const isMatch = await bcrypt.compare(pw, user.UserPW);
    if (!isMatch) return res.status(401).send('비밀번호가 일치하지 않습니다.');

    // 로그인 성공: 세션에 저장
    req.session.user = { id: user.UserID, name: user.UserName };
    res.send('로그인 성공!');
  });
});

// 현재 로그인 정보 확인
app.get('/me', (req, res) => {
  if (req.session.user) res.json(req.session.user);
  else res.status(401).send('로그인 필요');
});

// 로그아웃
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.send('로그아웃 되었습니다.');
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
