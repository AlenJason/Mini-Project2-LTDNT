interface NetworkBannerProps {
  online: boolean;
}

export function NetworkBanner({ online }: NetworkBannerProps) {
  if (online) return null;
  return (
    <div className="network-banner">
      Đang ngoại tuyến — khảo sát sẽ được lưu trên máy và tự đồng bộ khi có mạng.
    </div>
  );
}
