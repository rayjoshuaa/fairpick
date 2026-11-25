import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Dices, Info, Maximize, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const BASE_TITLE = "Teacher Tools: FairPick"

const SAMPLE_NAMES = [
  "Amara",
  "Ben",
  "Chanya",
  "David",
  "Emma",
  "Felix",
  "Grace",
  "Hugo",
  "Ink",
  "Jay",
  "Kanya",
  "Leo",
  "Mali",
  "Nina",
  "Oscar",
  "Ploy",
]

// Same parsing as the vanilla app: trim each line, drop blanks, and
// de-duplicate case-insensitively (first spelling wins).
function parseNames(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  text.split(/\r?\n/).forEach((line) => {
    const n = line.trim()
    if (n && !seen.has(n.toLowerCase())) {
      seen.add(n.toLowerCase())
      out.push(n)
    }
  })
  return out
}

// fairpick_lists shape: a plain object mapping list name -> raw list text.
function readLists(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem("fairpick_lists") || "{}"
    )
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    /* storage unavailable or corrupt — treat as no saved lists */
  }
  return {}
}

function writeLists(all: Record<string, unknown>) {
  try {
    localStorage.setItem("fairpick_lists", JSON.stringify(all))
  } catch {
    /* storage unavailable */
  }
}

// fairpick_draft shape: the raw textarea text (a plain string, not JSON).
function initialDraft(): string {
  try {
    return localStorage.getItem("fairpick_draft") ?? ""
  } catch {
    return ""
  }
}

// fairpick_state shape: { picked: string[], round: number }
function initialPickedState(): { picked: string[]; round: number } {
  try {
    const st: unknown = JSON.parse(
      localStorage.getItem("fairpick_state") || "null"
    )
    if (st && typeof st === "object") {
      const s = st as { picked?: unknown; round?: unknown }
      return {
        picked: Array.isArray(s.picked)
          ? s.picked.filter((p): p is string => typeof p === "string")
          : [],
        round: typeof s.round === "number" && s.round > 0 ? s.round : 1,
      }
    }
  } catch {
    /* storage unavailable or corrupt — start fresh */
  }
  return { picked: [], round: 1 }
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

export default function App() {
  const [initial] = useState(initialPickedState)
  const [draft, setDraft] = useState<string>(initialDraft)
  const [pickedRaw, setPickedRaw] = useState<string[]>(initial.picked)
  const [round, setRound] = useState<number>(initial.round)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [landedKey, setLandedKey] = useState(0)
  const [picking, setPicking] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [listFeedback, setListFeedback] = useState("")
  const [srStatus, setSrStatus] = useState("")
  const [listName, setListName] = useState("")
  const [selectedList, setSelectedList] = useState("")
  const [savedLists, setSavedLists] = useState<string[]>(() =>
    Object.keys(readLists())
  )
  const [soundOn, setSoundOn] = useState(true)
  const [animOn, setAnimOn] = useState(true)

  const audioRef = useRef<AudioContext | null>(null)
  const spinRef = useRef<number | null>(null)
  const pickingRef = useRef(false)
  const soundRef = useRef(true)
  soundRef.current = soundOn
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listNameRef = useRef<HTMLInputElement>(null)

  const names = useMemo(() => parseNames(draft), [draft])
  // The vanilla render() filters picked down to names still on the list.
  const picked = useMemo(
    () => pickedRaw.filter((p) => names.includes(p)),
    [pickedRaw, names]
  )
  const pickedCount = picked.length

  // Persist draft + state exactly like the vanilla saveDraft(): the draft
  // as a raw string, the state as JSON { picked, round }. Skipped on first
  // render so stored data is only rewritten after a real change, matching
  // the vanilla app, which only writes on actions.
  const firstPersist = useRef(true)
  useEffect(() => {
    if (firstPersist.current) {
      firstPersist.current = false
      return
    }
    try {
      localStorage.setItem("fairpick_draft", draft)
      localStorage.setItem(
        "fairpick_state",
        JSON.stringify({ picked: pickedRaw, round })
      )
    } catch {
      /* storage unavailable */
    }
  }, [draft, pickedRaw, round])

  const warmAudio = () => {
    try {
      audioRef.current =
        audioRef.current ||
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)()
      if (audioRef.current.state === "suspended") void audioRef.current.resume()
    } catch {
      /* audio unavailable */
    }
  }

  // Same beep as the vanilla app: sine wave, gain 0.0001 -> 0.18 -> 0.0001.
  const beep = (freq: number, delay: number, dur: number) => {
    if (!soundRef.current) return
    warmAudio()
    const ctx = audioRef.current
    if (!ctx) return
    try {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "sine"
      o.frequency.value = freq
      const t = ctx.currentTime + (delay || 0)
      const d = dur || 0.18
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d)
      o.connect(g)
      g.connect(ctx.destination)
      o.start(t)
      o.stop(t + d + 0.05)
    } catch {
      /* audio unavailable */
    }
  }

  const stopSpin = () => {
    if (spinRef.current !== null) {
      window.clearInterval(spinRef.current)
      window.clearTimeout(spinRef.current)
      spinRef.current = null
    }
  }

  useEffect(() => stopSpin, [])

  const newRound = () => {
    setPickedRaw([])
    setRound(1)
    setDisplayName(null)
    setFeedback("")
    document.title = BASE_TITLE
    setSrStatus("New round started")
  }

  const pick = () => {
    const currentNames = parseNames(draft)
    if (pickingRef.current) return
    if (currentNames.length === 0) {
      setFeedback("Add your class list first — paste names in the panel below")
      setSrStatus("Add your class list first")
      textareaRef.current?.focus()
      return
    }
    setFeedback("")
    warmAudio()
    let basePicked = pickedRaw.filter((p) => currentNames.includes(p))
    let pool = currentNames.filter((n) => !basePicked.includes(n))
    if (pool.length === 0) {
      // Everyone has had a turn: reset and start the next round, then pick
      // from the full list — exactly as the vanilla app does.
      basePicked = []
      const nextRound = round + 1
      setPickedRaw([])
      setRound(nextRound)
      setSrStatus(`Everyone has had a turn. Round ${nextRound} started`)
      pool = [...currentNames]
    }
    const winner = pool[Math.floor(Math.random() * pool.length)]
    pickingRef.current = true
    setPicking(true)

    const land = () => {
      const finalPicked = [...basePicked, winner]
      setPickedRaw(finalPicked)
      setDisplayName(winner)
      setLandedKey((k) => k + 1)
      beep(659.25, 0, 0.25)
      beep(880, 0.12, 0.35)
      pickingRef.current = false
      setPicking(false)
      document.title = `FairPick | ${winner}`
      setSrStatus(
        `Picked: ${winner} — ${finalPicked.length} of ${currentNames.length} picked this round`
      )
    }

    if (animOn && !reducedMotion() && pool.length > 1) {
      let steps = 0
      const maxSteps = 16 + Math.floor(Math.random() * 8)
      spinRef.current = window.setInterval(() => {
        setDisplayName(pool[Math.floor(Math.random() * pool.length)])
        beep(340 + Math.random() * 60, 0, 0.05)
        steps++
        if (steps >= maxSteps) {
          stopSpin()
          land()
        }
      }, 70)
    } else {
      spinRef.current = window.setTimeout(land, 60)
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else if (document.documentElement.requestFullscreen)
      void document.documentElement.requestFullscreen()
  }

  const canFullscreen =
    typeof document !== "undefined" &&
    !!document.documentElement.requestFullscreen

  // Latest handlers for the keyboard listener (mounted once).
  const handlersRef = useRef({ pick, newRound, toggleFullscreen })
  handlersRef.current = { pick, newRound, toggleFullscreen }

  // Keyboard shortcuts — same guards as the vanilla app: inert while
  // typing in an input, textarea or select, and Space never double-fires
  // from a focused button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT"
      )
        return
      if (t.closest && t.closest('[role="combobox"]')) return
      if (e.code === "Space") {
        if (t.closest && t.closest("button")) return
        e.preventDefault()
        handlersRef.current.pick()
      } else if (e.key === "n" || e.key === "N") {
        handlersRef.current.newRound()
      } else if (e.key === "f" || e.key === "F") {
        handlersRef.current.toggleFullscreen()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const handleDraftChange = (value: string) => {
    setDraft(value)
    const newNames = parseNames(value)
    setPickedRaw((prev) => prev.filter((p) => newNames.includes(p)))
  }

  const refreshSaved = () => {
    setSavedLists(Object.keys(readLists()))
  }

  const focusSavedLists = () => {
    document.getElementById("saved-lists-select")?.focus()
  }

  const saveList = () => {
    const name = listName.trim()
    if (!name) {
      setListFeedback("Give the list a name first, then press Save list")
      setSrStatus("Give the list a name first")
      listNameRef.current?.focus()
      return
    }
    if (names.length === 0) {
      setListFeedback("Add some names first, then save the list")
      textareaRef.current?.focus()
      return
    }
    const all = readLists()
    all[name] = draft
    writeLists(all)
    refreshSaved()
    setSelectedList(name)
    setListFeedback(`Saved “${name}” — ${names.length} names`)
    setSrStatus(`List saved: ${name}`)
  }

  const loadList = () => {
    const name = selectedList
    if (!name) {
      setListFeedback("Choose a saved list first")
      focusSavedLists()
      return
    }
    const all = readLists()
    if (all[name] != null) {
      const text = String(all[name])
      setDraft(text)
      setListName(name)
      newRound()
      setListFeedback(`Loaded “${name}” — ${parseNames(text).length} names`)
      setSrStatus(`List loaded: ${name}`)
    }
  }

  const deleteList = () => {
    const name = selectedList
    if (!name) {
      setListFeedback("Choose a saved list first")
      focusSavedLists()
      return
    }
    const all = readLists()
    delete all[name]
    writeLists(all)
    refreshSaved()
    setSelectedList("")
    setListFeedback(`Deleted “${name}”`)
    setSrStatus(`List deleted: ${name}`)
  }

  const loadSample = () => {
    setDraft(SAMPLE_NAMES.join("\n"))
    newRound()
    setListFeedback("Sample class loaded — 16 names")
    setSrStatus("Sample class loaded, 16 names")
  }

  const clearList = () => {
    setDraft("")
    newRound()
    setListFeedback("List cleared")
  }

  const progressText =
    names.length === 0
      ? "Add your class list below to begin"
      : `${pickedCount} of ${names.length} picked this round · ${names.length - pickedCount} still waiting`
  const progressValue =
    names.length === 0 ? 0 : (pickedCount / names.length) * 100

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col items-center overflow-hidden bg-background px-4 py-3 text-foreground">
        <header className="flex w-[90%] shrink-0 flex-col items-center gap-1 text-center">
          <Badge variant="secondary">Teacher Tools</Badge>
          <h1 className="text-2xl font-bold tracking-tight">FairPick</h1>
          <p className="max-w-xl text-xs text-muted-foreground [@media(max-height:720px)]:hidden">
            The random student picker that&apos;s actually fair — nobody gets
            picked twice until everyone has had a turn.
          </p>
        </header>

        <main className="flex w-full min-h-0 flex-1 justify-center pt-3">
          <Card className="flex h-full w-[90%] flex-col gap-2 py-3">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>Student picker</CardTitle>
                  <CardDescription className="[@media(max-height:720px)]:hidden">
                    Press Pick a student — FairPick only chooses from students
                    who haven&apos;t had a turn this round.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="How to use FairPick"
                      >
                        <Info />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>How to use</DialogTitle>
                        <DialogDescription>
                          FairPick in four steps.
                        </DialogDescription>
                      </DialogHeader>
                      <ol className="list-decimal space-y-2 pl-5 text-sm">
                        <li>
                          Paste your class list — one name per line — or tap
                          Try a sample class.
                        </li>
                        <li>
                          Press Pick a student. FairPick only chooses from
                          students who haven&apos;t had a turn this round.
                        </li>
                        <li>
                          When everyone has been picked, a new round starts
                          automatically.
                        </li>
                        <li>
                          Save named lists (Year 5A, Year 6B…) to reuse them
                          next lesson — they&apos;re stored in this browser
                          only.
                        </li>
                      </ol>
                      <Separator />
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Kbd>Space</Kbd> Pick a student
                        </span>
                        <span className="flex items-center gap-2">
                          <Kbd>N</Kbd> New round
                        </span>
                        <span className="flex items-center gap-2">
                          <Kbd>F</Kbd> Fullscreen
                        </span>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {canFullscreen && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleFullscreen}
                          aria-label="Fullscreen"
                        >
                          <Maximize />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Fullscreen</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-hidden">
              <Badge
                variant="secondary"
                className="min-w-24 shrink-0 justify-center"
              >
                Round {round}
              </Badge>

              <div className="flex h-[clamp(3.25rem,10vmin,6rem)] w-full shrink-0 items-center justify-center px-2">
                {displayName ? (
                  <span
                    key={landedKey}
                    className="animate-land max-w-full text-center text-[clamp(2rem,7.5vmin,4.25rem)] leading-[1.05] font-bold tracking-tight break-words"
                  >
                    {displayName}
                  </span>
                ) : (
                  <span className="max-w-full text-center text-[clamp(2rem,7.5vmin,4.25rem)] leading-[1.05] font-bold tracking-tight break-words text-muted-foreground">
                    Who&apos;s next?
                  </span>
                )}
              </div>

              <p className="flex h-5 w-full shrink-0 items-center justify-center overflow-hidden text-center text-sm whitespace-nowrap text-muted-foreground">
                {progressText}
              </p>

              <Progress
                value={progressValue}
                className="h-3 w-full max-w-xl shrink-0"
                aria-label="Students picked this round"
              />

              <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="w-56"
                  onClick={pick}
                  disabled={picking}
                >
                  <Dices />
                  Pick a student
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-36"
                  onClick={newRound}
                >
                  <RotateCcw />
                  New round
                </Button>
              </div>

              <p className="flex h-5 w-full shrink-0 items-center justify-center overflow-hidden text-center text-sm whitespace-nowrap text-muted-foreground">
                {feedback || "\u00A0"}
              </p>
              <div className="sr-only" aria-live="polite">
                {srStatus}
              </div>

              <Separator className="shrink-0" />

              <div className="grid w-full min-h-0 flex-1 grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                <section
                  aria-label="Your class list"
                  className="flex min-h-0 flex-col gap-2 rounded-xl border p-3 text-left"
                >
                  <Label className="text-base font-semibold text-foreground">
                    Your class list
                  </Label>
                  <p className="text-sm text-muted-foreground [@media(max-height:760px)]:hidden">
                    One name per line. Saved automatically in this browser —
                    no account needed.
                  </p>
                  <Textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    placeholder={"Amara\nBen\nChanya\nDavid\n…"}
                    aria-label="Class list, one name per line"
                    className="min-h-0 flex-1 resize-none field-sizing-fixed"
                  />
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Input
                      ref={listNameRef}
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="List name (e.g. Year 5A)"
                      aria-label="List name"
                      className="min-w-36 flex-1"
                    />
                    <Button
                      variant="secondary"
                      className="w-24"
                      onClick={saveList}
                    >
                      Save list
                    </Button>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Select
                      value={selectedList}
                      onValueChange={setSelectedList}
                    >
                      <SelectTrigger
                        id="saved-lists-select"
                        aria-label="Saved lists"
                        className="min-w-36 flex-1"
                      >
                        <SelectValue placeholder="Saved lists…" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedLists.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="w-20"
                      onClick={loadList}
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      className="w-20"
                      onClick={deleteList}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={loadSample}>
                      Try a sample class
                    </Button>
                    <Button
                      variant="outline"
                      className="w-20"
                      onClick={clearList}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="flex h-5 shrink-0 items-center overflow-hidden text-sm whitespace-nowrap text-muted-foreground">
                    {listFeedback || "\u00A0"}
                  </p>
                </section>

                <section
                  aria-label="Who's still waiting?"
                  className="flex min-h-0 flex-col gap-2 rounded-xl border p-3 text-left"
                >
                  <Label className="text-base font-semibold text-foreground">
                    Who&apos;s still waiting?
                  </Label>
                  <p className="text-sm text-muted-foreground [@media(max-height:760px)]:hidden">
                    Names are ticked off once picked this round. When everyone
                    has had a turn, a new round starts automatically.
                  </p>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {names.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        No names yet.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {names.map((n) =>
                          picked.includes(n) ? (
                            <Badge
                              key={n}
                              variant="outline"
                              className="gap-1 text-muted-foreground"
                            >
                              <Check className="size-3" />
                              <span className="line-through">{n}</span>
                            </Badge>
                          ) : (
                            <Badge key={n} variant="secondary">
                              {n}
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <Separator className="shrink-0" />

              <div className="flex shrink-0 flex-wrap items-center justify-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="sound"
                    checked={soundOn}
                    onCheckedChange={setSoundOn}
                  />
                  <Label htmlFor="sound">Sound</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="animation"
                    checked={animOn}
                    onCheckedChange={setAnimOn}
                  />
                  <Label htmlFor="animation">Spinning animation</Label>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Kbd>Space</Kbd> Pick
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>N</Kbd> New round
                </span>
                <span className="flex items-center gap-1.5">
                  <Kbd>F</Kbd> Fullscreen
                </span>
              </div>
            </CardFooter>
          </Card>
        </main>

        <footer className="shrink-0 pt-3 text-center text-xs text-muted-foreground">
          © 2026{" "}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            asChild
          >
            <a
              href="https://rayjoshuaa-portfolio.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ray Joshua
            </a>
          </Button>
          . All rights reserved.
        </footer>
      </div>
    </TooltipProvider>
  )
}
