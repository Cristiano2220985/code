export function trapDialogTab(event, dialog) {
  if (event.key !== 'Tab') return

  const controls = dialog.querySelectorAll(
    'button:not(:disabled), input:not(:disabled), select:not(:disabled)',
  )
  const first = controls[0]
  const last = controls[controls.length - 1]
  const active = document.activeElement
  const boundary = event.shiftKey ? first : last

  if (!first || active === dialog || active === boundary) {
    event.preventDefault()
    const target = event.shiftKey ? last : first
    target?.focus()
  }
}
