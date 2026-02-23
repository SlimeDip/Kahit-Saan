export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay__spinner" />
      <span className="loading-overlay__text">Searching nearby restaurants...</span>
    </div>
  );
}
