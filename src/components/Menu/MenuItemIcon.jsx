export default function MenuItemIcon({ icon }) {
  if (!icon) return null;

  return (
    <span
      className="menu-icon"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );
}
