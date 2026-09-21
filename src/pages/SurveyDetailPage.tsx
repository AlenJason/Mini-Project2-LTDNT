import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Survey } from '../types/survey';
import { deleteSurvey, getSurvey } from '../services/storage';
import { deleteRemoteSurvey } from '../services/syncService';
import { mapsUrl } from '../services/geolocation';
import { SyncBadge } from '../components/SyncBadge';

export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getSurvey(id).then((s) => setSurvey(s ?? null));
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Xoá khảo sát này?')) return;
    await deleteSurvey(id);
    void deleteRemoteSurvey(id);
    navigate('/');
  }

  if (survey === undefined) return <div className="page">Đang tải…</div>;
  if (survey === null) return <div className="page">Không tìm thấy khảo sát.</div>;

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/')} aria-label="Quay lại">
          ←
        </button>
        <h1>Chi tiết khảo sát</h1>
      </header>

      <div className="survey-detail">
        <div className="survey-detail-title">
          <h2>{survey.title}</h2>
          <SyncBadge status={survey.syncStatus} />
        </div>

        {survey.photoDataUrl && (
          <img className="photo-preview" src={survey.photoDataUrl} alt="Ảnh hiện trường" />
        )}

        <dl>
          <dt>Người khảo sát</dt>
          <dd>{survey.surveyor || '—'}</dd>

          <dt>Vị trí</dt>
          <dd>{survey.location || '—'}</dd>

          <dt>Ghi chú</dt>
          <dd className="notes">{survey.notes || '—'}</dd>

          <dt>Toạ độ GPS</dt>
          <dd>
            {survey.coordinates ? (
              <a href={mapsUrl(survey.coordinates)} target="_blank" rel="noreferrer">
                {survey.coordinates.latitude.toFixed(6)}, {survey.coordinates.longitude.toFixed(6)}
              </a>
            ) : (
              '—'
            )}
          </dd>

          <dt>Tạo lúc</dt>
          <dd>{new Date(survey.createdAt).toLocaleString('vi-VN')}</dd>

          <dt>Cập nhật lúc</dt>
          <dd>{new Date(survey.updatedAt).toLocaleString('vi-VN')}</dd>
        </dl>

        <div className="detail-actions">
          <Link to={`/edit/${survey.id}`} className="btn btn-secondary">
            Sửa
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
