import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Tooltip behaviour that satisfies WCAG SC 1.4.13 Content on Hover or Focus
 * (accessibility findings #16, #17).
 *
 * The three things the criterion asks for:
 *
 *   Dismissible — Escape hides the tooltip without moving the pointer or focus.
 *                 The keydown is captured, so it dismisses the tooltip *instead
 *                 of* closing the dropdown or the dialog.
 *   Hoverable   — the tooltip sits a few pixels above its trigger, so leaving it
 *                 open for a short grace period lets the pointer travel onto it.
 *                 `cancelHide` on the tooltip itself keeps it there.
 *   Persistent  — it only goes away on leave, on Escape, or when the component
 *                 unmounts. Nothing hides it on a timer.
 *
 * Bind `show` to both mouseenter and focus, and `hide` to both mouseleave and
 * blur, so pointer and keyboard users get the same thing.
 */

/** Grace period, in ms, for the pointer to cross the gap onto the tooltip */
const HOVER_GRACE = 150

export function useTooltip() {
  const visible = ref(false)
  const style   = ref({})
  const text    = ref('')

  let hideTimer = null

  function cancelHide() {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  /**
   * Anchor the tooltip above `el`.
   * @param {Element} el              the trigger
   * @param {string}  [value]         tooltip text, when the caller drives it
   * @param {'center'|'left'} [align] which edge to anchor to; pair 'left' with
   *                                  a translateY-only transform in the CSS
   */
  function show(el, value, align = 'center') {
    if (!el) return
    cancelHide()
    const rect = el.getBoundingClientRect()
    style.value = {
      left: `${align === 'left' ? rect.left : rect.left + rect.width / 2}px`,
      top:  `${rect.top - 8}px`,
    }
    if (value !== undefined) text.value = value
    visible.value = true
  }

  /** Delayed, so the pointer can reach the tooltip without it vanishing */
  function hide() {
    cancelHide()
    hideTimer = setTimeout(() => { visible.value = false }, HOVER_GRACE)
  }

  function hideNow() {
    cancelHide()
    visible.value = false
  }

  // Captured, so a visible tooltip swallows the Escape rather than letting it
  // fall through to the dropdown/dialog handlers on the same element
  function onKeydown(e) {
    if (e.key !== 'Escape' || !visible.value) return
    hideNow()
    e.stopPropagation()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown, true))
  onBeforeUnmount(() => {
    cancelHide()
    document.removeEventListener('keydown', onKeydown, true)
  })

  return { visible, style, text, show, hide, hideNow, cancelHide }
}
