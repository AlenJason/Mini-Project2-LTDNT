import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@capacitor-firebase/authentication';
import type { Survey } from '../types/survey';
import { getAllSurveys, countPending } from '../services/storage';
import { syncPendingSurveys } from '../services/syncService';
import { useAutoSync } from '../hooks/useAutoSync';
import { NetworkBanner } from '../components/NetworkBanner';
import { SyncBadge } from '../components/SyncBadge';
import { UserMenu } from '../components/UserMenu';

export function SurveyListPage({ user }: { user: User | null }) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const [all, pendingCount] = await Promise.all([getAllSurveys(), countPending()]);
    setSurveys(all);
    setPending(pendingCount);
  }, []);

  const online = useAutoSync(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSyncNow() {
    setSyncing(true);
    try {
      await syncPendingSurveys();
      await refresh();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Khảo sát hiện trường</h1>
        <span className={`status-dot ${online ? 'online' : 'offline'}`} title={online ? 'Đang online' : 'Đang offline'} />
        <UserMenu user={user} />
      </header>

      <NetworkBanner online={online} />

      <div className="toolbar">
        <button
          className="btn btn-secondary"
          onClick={handleSyncNow}
          disabled={!online || syncing || pending === 0}
        >
          {syncing ? 'Đang đồng bộ…' : `Đồng bộ ngay (${pending})`}
        </button>
        <Link to="/new" className="btn btn-primary">
          + Khảo sát mới
        </Link>
      </div>

      {surveys.length === 0 ? (
        <p className="empty-state">Chưa có khảo sát nào. Nhấn "Khảo sát mới" để bắt đầu.</p>
      ) : (
        <ul className="survey-list">
          {surveys.map((survey) => (
            <li key={survey.id}>
              <Link to={`/survey/${survey.id}`} className="survey-card">
                {survey.photoDataUrl && (
                  <img className="survey-thumb" src={survey.photoDataUrl} alt="" />
                )}
                <div className="survey-card-main">
                  <h2>{survey.title}</h2>
                  <p className="survey-meta">
                    {survey.surveyor || 'Chưa rõ người khảo sát'} · {survey.location || 'Chưa có vị trí'}
                  </p>
                  <p className="survey-date">{new Date(survey.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <SyncBadge status={survey.syncStatus} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
