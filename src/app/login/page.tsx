'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth) {
        setError("인증 서비스를 사용할 수 없습니다. 나중에 다시 시도해주세요.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } catch (err) {
        const authError = err as AuthError;
        if (authError.code === 'auth/invalid-credential') {
          setError('이메일 또는 비밀번호가 잘못되었습니다.');
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
              계정에 로그인하려면 아래에 이메일을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
