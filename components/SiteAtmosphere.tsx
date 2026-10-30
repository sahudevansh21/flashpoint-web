const MARTIAN_HORIZON = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/3c83091e-4046-4fd6-adbb-2edb728be79a.mp4";

export function SiteAtmosphere() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <video autoPlay loop muted playsInline preload="metadata" className="site-backdrop-video">
        <source src={MARTIAN_HORIZON} type="video/mp4" />
      </video>
    </div>
  );
}
