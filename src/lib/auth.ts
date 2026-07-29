// Supabase Auth는 이메일 기반이라 "아이디"를 내부적으로 가짜 이메일로 변환해 사용한다.
const AUTH_EMAIL_DOMAIN = "users.gogumamarket.app";

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;

export function isValidUsername(username: string) {
  return USERNAME_PATTERN.test(username.trim());
}
