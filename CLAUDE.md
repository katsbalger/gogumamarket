# 고구마마켓

중고 물품을 사고팔 수 있는 웹 서비스.

## 기술 스택

- Next.js (App Router)
- Supabase (데이터베이스, 인증)
- Tailwind CSS (스타일링)
- TypeScript

## MCP

- Supabase MCP 연결됨 - DB 조작(테이블 조회, 마이그레이션, 쿼리 실행 등) 시 MCP를 통해 직접 수행
- 스키마 변경 전 `list_tables`로 기존 구조 먼저 확인
- 문제 발생 시 `get_logs`, `get_advisors`로 먼저 확인 후 수정

## 규칙

- 한국어 UI
- 가격은 원화(₩) - "₩10,000" 형태로 표시
- 모바일 반응형 필수
- 디자인은 깔끔하고 모던한 스타일
- 색상 테마: 주황색 계열 (고구마 컨셉)

## 주요 기능

- 상품 목록 (메인 페이지)
- 상품 등록 / 상세 / 수정 / 삭제
- 가입·로그인 (Supabase Auth, 아이디·비밀번호)
- 결제 (토스페이먼츠)

## 데이터베이스

- Supabase 프로젝트: `gogumamarket` (project_id: `svlvnksvsoxrzvgbpkvc`, region: ap-northeast-2)
- `profiles`: 아이디(username) 저장, `auth.users` 1:1 연동 (가입 시 트리거로 자동 생성)
- `products`: 상품 테이블 (RLS 적용 - 조회는 전체 공개, 등록/수정/삭제는 본인 소유만 가능)
- Storage 버킷 `product-images`: 상품 이미지 업로드용 (public read)

### 아이디 기반 인증 구현 방식

Supabase Auth는 이메일 기반이라, "아이디"를 `${username}@users.gogumamarket.app` 형태의 가짜 이메일로 변환해 내부적으로 사용한다 (`src/lib/auth.ts`). UI에는 이메일이 노출되지 않는다.

**필수 수동 설정 (한 번만):** Supabase 대시보드 → Authentication → Sign In / Providers → Email → **"Confirm email" 옵션을 꺼야 한다.** 가짜 이메일 주소로는 확인 메일을 받을 수 없고, 무료 프로젝트의 이메일 발송 한도가 매우 낮아 (`over_email_send_rate_limit`) 반복 가입 시도 시 바로 막힌다. 이 옵션을 끄면 가입 즉시 로그인이 가능해진다. (MCP 도구로는 이 설정을 변경할 수 없어 대시보드에서 직접 꺼야 함)
