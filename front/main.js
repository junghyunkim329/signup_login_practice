// 피라미드 찍기 기능 (home.html에서 사용)
function p() {
  const input = document.getElementById('num').value;
  const num = Number(input);
  const output = document.getElementById('pi');
  output.innerHTML = '';

  for (let i = 1; i <= num; i++) {
    const space = '&nbsp;'.repeat(num - i);
    const stars = '*'.repeat(2 * i - 1);
    output.innerHTML += space + stars + '<br>';
  }
}

// 회원가입
function signUp() {
  const id = document.getElementById('signup-id').value;
  const pw = document.getElementById('signup-pw').value;
  const name = document.getElementById('signup-name').value;

  if (!id || !pw || !name) {
    alert('모든 정보를 입력해주세요.');
    return;
  }

  fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, pw, name })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      if (msg.includes('성공')) {
        window.location.href = 'login.html';
      }
    })
    .catch(err => {
      console.error(err);
      alert('회원가입 중 오류 발생');
    });
}

// 로그인
function logIn() {
  const id = document.getElementById('login-id').value;
  const pw = document.getElementById('login-pw').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, pw })
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => Promise.reject(msg));
      return res.text();
    })
    .then(msg => {
      alert(msg);
      if (msg.includes('성공')) {
        window.location.href = '/'; // 홈으로 이동
      }
    })
    .catch(err => {
      alert(err || '로그인 실패');
    });
}

// 로그아웃
function logOut() {
  fetch('/logout', {
    method: 'POST'
  })
    .then(res => res.text())
    .then(() => {
      location.reload(); // 새로고침으로 로그인 상태 반영
    });
}

// 로그인 여부 확인 및 UI 표시 (home.html에서 사용)
window.addEventListener('DOMContentLoaded', () => {
  fetch('/me')
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(user => {
      const welcome = document.getElementById('welcome');
      if (welcome) welcome.innerText = `${user.name}님 환영합니다!`;

      // UI 처리
      const signupLink = document.getElementById('signup-link');
      const loginLink = document.getElementById('login-link');
      const logoutLink = document.getElementById('logout-link');

      if (signupLink) signupLink.style.display = 'none';
      if (loginLink) loginLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline';
    })
    .catch(() => {
      const welcome = document.getElementById('welcome');
      if (welcome) welcome.innerText = '로그인이 필요합니다.';

      const signupLink = document.getElementById('signup-link');
      const loginLink = document.getElementById('login-link');
      const logoutLink = document.getElementById('logout-link');

      if (signupLink) signupLink.style.display = 'inline';
      if (loginLink) loginLink.style.display = 'inline';
      if (logoutLink) logoutLink.style.display = 'none';
    });
});
