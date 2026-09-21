import type { User } from '@capacitor-firebase/authentication';
import { signOut } from '../services/authService';

export function UserMenu({ user }: { user: User | null }) {
  if (!user) return null;

  return (
    <div className="user-menu">
      {user.photoUrl ? (
        <img className="user-avatar" src={user.photoUrl} alt="" referrerPolicy="no-referrer" />
      ) : (
        <div className="user-avatar user-avatar-fallback">
          {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
        </div>
      )}
      <button className="btn-link" onClick={() => signOut()}>
        Đăng xuất
      </button>
    </div>
  );
}
