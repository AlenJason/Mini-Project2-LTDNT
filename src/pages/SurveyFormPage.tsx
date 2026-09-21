import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User } from '@capacitor-firebase/authentication';
import type { SurveyInput } from '../types/survey';
import { createSurvey, getSurvey, updateSurvey } from '../services/storage';
import { capturePhoto } from '../services/camera';
import { getCurrentCoordinates } from '../services/geolocation';

const EMPTY_FORM: SurveyInput = { title: '', surveyor: '', location: '', notes: '' };

export function SurveyFormPage({ user }: { user: User | null }) {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<SurveyInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [locating, setLocating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getSurvey(id).then((survey) => {
        if (survey) {
          const { title, surveyor, location, notes, photoDataUrl, coordinates } = survey;
          setForm({ title, surveyor, location, notes, photoDataUrl, coordinates });
        }
        setLoading(false);
      });
    } else if (user?.displayName) {
      setForm((f) => ({ ...f, surveyor: user.displayName ?? '' }));
    }
  }, [id, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateSurvey(id, form);
        navigate(`/survey/${id}`);
      } else {
        const created = await createSurvey(form);
        navigate(`/survey/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCapturePhoto() {
    setActionError(null);
    setCapturingPhoto(true);
    try {
      const dataUrl = await capturePhoto();
      if (dataUrl) setForm((f) => ({ ...f, photoDataUrl: dataUrl }));
    } catch {
      setActionError('Không thể mở camera. Kiểm tra quyền truy cập camera của ứng dụng.');
    } finally {
      setCapturingPhoto(false);
    }
  }

  async function handleGetLocation() {
    setActionError(null);
    setLocating(true);
    try {
      const coordinates = await getCurrentCoordinates();
      setForm((f) => ({ ...f, coordinates }));
    } catch {
      setActionError('Không thể lấy vị trí GPS. Kiểm tra quyền truy cập vị trí của ứng dụng.');
    } finally {
      setLocating(false);
    }
  }

  if (loading) return <div className="page">Đang tải…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)} aria-label="Quay lại">
          ←
        </button>
        <h1>{isEdit ? 'Sửa khảo sát' : 'Khảo sát mới'}</h1>
      </header>

      <form className="survey-form" onSubmit={handleSubmit}>
        <label>
          Tiêu đề *
          <input
            name="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="VD: Khảo sát chất lượng nước sông X"
          />
        </label>

        <label>
          Người khảo sát
          <input
            name="surveyor"
            value={form.surveyor}
            onChange={(e) => setForm({ ...form, surveyor: e.target.value })}
            placeholder="Họ tên"
          />
        </label>

        <label>
          Vị trí
          <input
            name="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Địa điểm khảo sát"
          />
        </label>

        <label>
          Ghi chú
          <textarea
            name="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={5}
            placeholder="Mô tả chi tiết, quan sát tại hiện trường…"
          />
        </label>

        {actionError && <p className="login-error">{actionError}</p>}

        <div className="field-group">
          <span className="field-group-label">Ảnh hiện trường</span>
          {form.photoDataUrl && (
            <img className="photo-preview" src={form.photoDataUrl} alt="Ảnh hiện trường" />
          )}
          <div className="field-group-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCapturePhoto} disabled={capturingPhoto}>
              {capturingPhoto ? 'Đang mở camera…' : form.photoDataUrl ? 'Chụp lại' : '📷 Chụp ảnh'}
            </button>
            {form.photoDataUrl && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm((f) => ({ ...f, photoDataUrl: undefined }))}
              >
                Xoá ảnh
              </button>
            )}
          </div>
        </div>

        <div className="field-group">
          <span className="field-group-label">Toạ độ GPS</span>
          {form.coordinates && (
            <p className="coordinates-value">
              {form.coordinates.latitude.toFixed(6)}, {form.coordinates.longitude.toFixed(6)}
            </p>
          )}
          <button type="button" className="btn btn-secondary btn-block" onClick={handleGetLocation} disabled={locating}>
            {locating ? 'Đang lấy vị trí…' : '📍 Lấy vị trí hiện tại'}
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Đang lưu…' : 'Lưu khảo sát'}
        </button>
      </form>
    </div>
  );
}
