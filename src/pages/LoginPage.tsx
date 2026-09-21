import { useState } from 'react';
import { signInWithGoogle } from '../services/authService';

export function LoginPage({ configured }: { configured: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page login-page">
      <div className="login-card">
        <h1>Khảo sát hiện trường</h1>
        <p className="login-subtitle">Đăng nhập để bắt đầu ghi nhận khảo sát của bạn.</p>

        {!configured && (
          <p className="login-warning">
            Ứng dụng chưa được cấu hình Firebase. Xem hướng dẫn trong README.md
            (mục "Cấu hình đăng nhập Google") để thêm biến môi trường
            <code> VITE_FIREBASE_*</code>.
          </p>
        )}

        {error && <p className="login-error">{error}</p>}

        <button
          className="btn btn-google btn-block"
          onClick={handleGoogleLogin}
          disabled={!configured || loading}
        >
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập bằng Google'}
        </button>
      </div>
    </div>
  );
}
