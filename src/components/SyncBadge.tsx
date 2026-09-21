import type { SyncStatus } from '../types/survey';

export function SyncBadge({ status }: { status: SyncStatus }) {
  const isSynced = status === 'synced';
  return (
    <span className={`sync-badge ${isSynced ? 'synced' : 'pending'}`}>
      {isSynced ? 'Đã đồng bộ' : 'Chờ đồng bộ'}
    </span>
  );
}
