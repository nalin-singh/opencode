import { createMemo, onMount } from "solid-js"
import { useSync } from "@tui/context/sync"
import { DialogSelect, type DialogSelectOption } from "@tui/ui/dialog-select"
import type { TextPart } from "@opencode-ai/sdk/v2"
import { Locale } from "@/util/locale"
import { useDialog } from "../../ui/dialog"

export function DialogSearchMessages(props: { sessionID: string; onMove: (messageID: string) => void }) {
  const sync = useSync()
  const dialog = useDialog()

  onMount(() => {
    dialog.setSize("large")
  })

  const options = createMemo((): DialogSelectOption<string>[] => {
    const messages = sync.data.message[props.sessionID] ?? []
    const result: DialogSelectOption<string>[] = []
    for (const message of messages) {
      const part = (sync.data.part[message.id] ?? []).find((x) => x.type === "text" && !x.synthetic) as TextPart
      if (!part) continue
      result.push({
        title: part.text.replace(/\n/g, " ").slice(0, 100),
        value: message.id,
        footer: `${message.role === "user" ? "User" : "Assistant"} · ${Locale.time(message.time.created)}`,
        onSelect: (dialog) => {
          props.onMove(message.id)
          dialog.clear()
        },
      })
    }
    result.reverse()
    return result
  })

  return <DialogSelect onMove={(option) => props.onMove(option.value)} title="Search Messages" options={options()} />
}
