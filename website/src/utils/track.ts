export default function track({ label, category, action }) {
  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('event', 'click', {
      event_category: category,
      event_action: action,
      event_label: label,
    });
  }
}
