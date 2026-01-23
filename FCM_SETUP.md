# Firebase Cloud Messaging (FCM) 설정 가이드

## ⚠️ 중요: 무료 계정 사용자

**Firebase 무료 계정에서는 Cloud Functions를 사용할 수 없습니다.**

이 프로젝트는 **Cloud Functions 없이** 클라이언트 기반으로 알림을 구현합니다:
- ✅ 사용자가 앱을 열 때 시간 체크
- ✅ 설정된 시간(11:30)에 알림 표시
- ✅ 무료 계정에서도 완벽하게 작동
- ✅ Service Worker를 통해 백그라운드에서도 작동

## 1. Firebase 콘솔에서 VAPID 키 생성

1. Firebase 콘솔 (https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 프로젝트 설정 → 클라우드 메시징 탭
4. "Web 푸시 인증서" 섹션에서 "새 키 쌍 생성"
5. 공개 키(Public Key)를 복사

## 2. .env.local 파일에 추가

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_public_key_here
```

## 3. Firestore 보안 규칙 업데이트

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null;
    }
  }
}
```

## 4. 알림 스케줄 설정

현재 설정: **평일(월-금) 오전 11:30**

변경하려면 `src/firebase/use-lunch-notification.ts`의 다음 부분 수정:

```typescript
if (hours !== 11 || minutes !== 30) {
  return;
}
```

예시:
- 오전 11:50: `if (hours !== 11 || minutes !== 50)`
- 오후 12:30: `if (hours !== 12 || minutes !== 30)`

### 특정 요일에만 알림 (선택사항)

```typescript
const day = now.getDay(); // 0=일, 1=월, ..., 6=토
if (day === 0 || day === 6) return; // 주말 제외
```

## 5. 앱에서 사용하기

### 단계 1: 알림 권한 요청
- 앱 접속 시 자동으로 알림 권한 요청 프롬프트 표시
- "알림 받기" 클릭

### 단계 2: 알림 수신
- 앱을 열어두거나 백그라운드에서 실행 중일 때
- 설정된 시간(11:30)에 자동으로 알림 표시

### 단계 3: 알림 클릭
- 알림을 클릭하면 앱으로 포커스

## 6. 작동 원리

### 포그라운드 (앱을 열어둔 경우)
```typescript
// 1분마다 현재 시간 체크
// 11:30이면 알림 표시
// Firestore에 lastNotificationDate 저장하여 중복 방지
```

### 백그라운드 (Service Worker)
```javascript
// push 이벤트 수신
// 알림 표시
// 클릭 시 앱 포커스
```

## 7. 문제 해결

### 알림이 안 옴

**앱을 열어둔 상태에서 시간이 지나도 안 옴:**
- 콘솔에서 오류 확인 (F12 → Console)
- Firestore에서 사용자 문서 확인
- 알림 권한이 "허용"으로 설정되어 있는지 확인

**시간 설정 확인:**
```typescript
const now = new Date();
console.log(`현재 시간: ${now.getHours()}:${now.getMinutes()}`);
```

### 알림 권한 묻지 않음
- 이전에 "거부"한 경우, 브라우저 설정에서 수동으로 변경 필요
- Chrome: 주소창 왼쪽 🔒 → 알림 → 허용

### Firestore 쓰기 권한 오류
- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- 사용자가 로그인되어 있는지 확인

## 8. 고급 설정

### 특정 요일만 알림
`src/firebase/use-lunch-notification.ts`에서:
```typescript
const day = now.getDay(); // 0=일, 1=월, ..., 6=토
if (day === 0 || day === 6) return; // 주말 제외
```

### 여러 시간에 알림
```typescript
const notificationTimes = [
  { hour: 11, minute: 30 },
  { hour: 17, minute: 0 },
];

const shouldNotify = notificationTimes.some(
  t => hours === t.hour && minutes === t.minute
);
```

### 사용자 시간대 설정
```typescript
// Firestore에 사용자 시간대 저장
// 그 시간대로 알림 시간 계산
```

## 9. Cloud Functions 업그레이드 시 (유료 계정)

나중에 유료 계정으로 업그레이드하면:

```bash
# 1. 함수 배포
firebase deploy --only functions

# 2. Cloud Functions 전용 코드 사용 가능
# functions/index.js의 코드 활성화

# 3. 클라이언트 코드 제거 (선택)
# use-lunch-notification.ts 제거
```

## 10. 참고 자료
- [Firebase Cloud Messaging 문서](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

